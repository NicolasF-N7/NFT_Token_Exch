// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;
import "standard/ERC721Enumerable.sol";
import "contracts/TokenManager.sol";

contract TokenManagerEnumerable is TokenManager, ERC721Enumerable {
  uint[] internal tokenIndexes; // The list of all tokens created
  mapping(uint => uint) internal indexTokens;//From an index (in tokenIndexes array) gives the tokenID associated. i.e. it is tokenIndexes reversed access
  mapping(address => uint[]) internal ownerTokenIndexes;// Gives from an address the list of all the tokenId owned by it.
  mapping(uint => uint) internal tokenTokenIndexes;//From a tokenId, it gives the index of that token within the list of the owner's tokens.

  constructor() public TokenManager(){
    supportedInterfaces[
        this.totalSupply.selector ^
        this.tokenByIndex.selector ^
        this.tokenOfOwnerByIndex.selector
    ] = true;
  }

  function totalSupply() external view returns (uint256){
    return tokenIndexes.length;
  }

  function tokenByIndex(uint256 _index) external view returns (uint256){
    requires(_index < tokenIndexes.length);
    return tokenIndexes[_index];
  }

  function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256){
    requires(_index < balances[_owner]);
    return ownerTokenIndexes[_owner][_index];
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) public override {
    address owner = ownerOf(_tokenId);

    //Check requirements
    require(msg.sender == owner || msg.sender == allowance[_tokenId] || authorised[owner][msg.sender]);//implicitly check that token is valid
    require(_from == owner);
    require(_to != address(0));

    //Do the transferring
    emit Transfer(_from, _to, _tokenId);
    owners[_tokenId] = _to;
    balances[owner]--;
    balances[_to]++;
    if(allowance[_tokenId] != address(0)){
      delete allowance[_tokenId];
    }

    //================Enumerable================
    //removing token in _from tokens list
    uint fromTokenIndex = tokenTokenIndexes[_tokenId];
    uint fromBalance = balance[_from];//Already decreased by one previously
    if(fromTokenIndex != fromBalance){//we have to do more than just decreasing the array length
      uint256 fromLastTokenId = ownerTokenIndexes[_from][fromBalance];
      ownerTokenIndexes[_from][fromTokenIndex] = fromLastTokenId;//If errors, Look here, the second index

      //update the index of the token we just moved within the list of _from's tokens
      tokenTokenIndexes[fromLastTokenId] = fromTokenIndex;
    }

    ownerTokenIndexes[_from].length--;

    //Add the token to _to list of token
    ownerTokenIndexes[_to].push(_tokenId);

    //update tokenTokenIndexes[_tokenId], to the new index of the tokenId within the list of tokens of _to
    tokenToken[_tokenId] = balance[_to] - 1;
  }

  function burnToken(uint256 _tokenId) public{
    address owner = ownerOf(_tokenId);
    require(owner == msg.sender || allowance[_tokenId] == msg.sender
        || authorised[owner][msg.sender]);

    //Burning the tokens
    burned[_tokenId] = true;
    balances[owner]--;
    emit Transfer(owner, address(0), _tokenId);

    //=====Enumerable=====
    uint fromTokenIndex = tokenTokenIndexes[_tokenId];
    uint fromBalance = balance[_from];//Already decreased by one previously
    if(fromTokenIndex != fromBalance){//we have to do more than just decreasing the array length
      uint256 fromLastTokenId = ownerTokenIndexes[_from][fromBalance];
      ownerTokenIndexes[_from][fromTokenIndex] = fromLastTokenId;//If errors, Look here, the second index

      //update the index of the token we just moved within the list of _from's tokens
      tokenTokenIndexes[fromLastTokenId] = fromTokenIndex;
    }

    ownerTokenIndexes[_from].length--;
    delete tokenToken[_tokenId];

    //Dealing with tokenIndexes
    uint oldIndex = indexTokens[_tokenId];
    uint totalTokenCount = tokenIndexes.length;
    if(oldIndex != totalTokenCount - 1){
      tokenIndexes[oldIndex] = tokenIndexes[totalTokenCount-1];
    }
    tokenIndexes.length--;
  }

  function mintToken() public{
    //increment the number of token owned by the caller of mintToken
    balances[msg.sender] = balances[msg.sender].add(1);
    //The tokenId of the token currently being created is maxId after this operation. i.e. first token ID is 1
    maxId = maxId.add(1);
    //Set the ownership
    owners[maxId] = msg.sender;
    //Signal that a token has been created
    emit Transfer(address(0), msg.sender, maxId);

    //=====Enumerable=====
    tokenIndexes.push(maxId);
    indexTokens[maxId] = tokenIndexes.length-1;
    ownerTokenIndexes[msg.sender].push(maxId);
    tokenTokenIndexes[maxId] = ownerTokenIndexes[msg.sender].length-1;

  }

}

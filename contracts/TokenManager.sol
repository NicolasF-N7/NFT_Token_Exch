// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;
import "contracts/CheckerERC165.sol";//Path from root dir of the project
import "standard/ERC721.sol";
import "standard/ERC721TokenReceiver.sol";
import "libraries/SafeMath8.sol";

contract TokenManager is ERC721, CheckerERC165{
  using SafeMath for uint256;

  // The address of the contract creator
  address internal creator; // = GOD

  // The highest valid tokenId, for checking if a tokenId is valid
  uint256 internal maxId;

  // A mapping storing the balance of each address. i.e. how much objects someone has registered.
  mapping(address => uint256) internal balances;

  // A mapping of burnt tokens, for checking if a tokenId is valid
  mapping(uint256 => bool) internal burned;

  // A mapping of token owners
  mapping(uint256 => address) internal owners;

  // A mapping of the "approved" address for each token
  mapping (uint256 => address) internal allowance;

  // A nested mapping for managing "operators". Authorize sb to control all the token of another address.
  mapping (address => mapping (address => bool)) internal authorised;

  constructor() CheckerERC165(){
    creator = msg.sender;
    maxId = 0x0;

    supportedInterfaces[
      this.balanceOf.selector ^
      this.ownerOf.selector ^
      bytes4(keccak256("safeTransferFrom(address,address,uint256"))^
      bytes4(keccak256("safeTransferFrom(address,address,uint256,bytes"))^
      this.transferFrom.selector ^
      this.approve.selector ^
      this.setApprovalForAll.selector ^
      this.getApproved.selector ^
      this.isApprovedForAll.selector
    ] = true;
  }

  function isValidToken(uint256 _tokenId) internal view returns(bool){
    return _tokenId != 0 && _tokenId <= maxId && !burned[_tokenId];
  }

  //external car pa utilisé dans TokenManager
  function balanceOf(address _owner) external view override returns (uint256){
    return balances[_owner];
  }

  //public : because used inside this contract
  function ownerOf(uint256 _tokenId) public view override returns (address){
    require(isValidToken(_tokenId));
    return owners[_tokenId];
  }

  /*
  Mint a token
  Associate metadata to it (Comming feature)
  */
  function mintToken() public{
    //increment the number of token owned by the caller of mintToken
    balances[msg.sender] = balances[msg.sender].add(1);

    //The tokenId of the token currently being created is maxId after this operation. i.e. first token ID is 1
    maxId = maxId.add(1);

    //Set the ownership
    owners[maxId] = msg.sender;

    //Signal that a token has been created
    emit Transfer(address(0), msg.sender, maxId);
  }

  /*
  Burn - Destroy a token. It will no longer be attached to his metadata, and not transferable anymore.
  */
  function burnToken(uint256 _tokenId) public{
    address owner = ownerOf(_tokenId);
    require(owner == msg.sender || allowance[_tokenId] == msg.sender
        || authorised[owner][msg.sender]);

    //Burning the tokens
    burned[_tokenId] = true;
    balances[owner]--;

    emit Transfer(owner, address(0), _tokenId);
  }

  /*
  Set authorised address for the sender.
  */
  function setApprovalForAll(address _operator, bool _approved) external override {
    emit ApprovalForAll(msg.sender, _operator, _approved);
    authorised[msg.sender][_operator] = _approved;
  }

  /*
  get the list of operator addresses having access to all tokens of the sender.
  */
  function isApprovedForAll(address _owner, address _operator) external view override returns (bool){
    return authorised[_owner][_operator];
  }

  /*
  Set authorisation for one token from the approved address of the sender. Only one person can be approved for a token at a time.
  */
  function approve(address _approved, uint256 _tokenId) external override {
    //Check for rights
    address owner = ownerOf(_tokenId);
    require(msg.sender == owner || authorised[owner][msg.sender]);

    //Approve the token access to _approved address
    emit Approval(owner, _approved, _tokenId);
    allowance[_tokenId] = _approved;
  }

  /*
  return if an address is approved / has the ownership of a token
  */
  function getApproved(uint256 _tokenId) external view override returns (address){
    require(isValidToken(_tokenId));
    return allowance[_tokenId];
  }

  /*
  Changed to not payable because the commission is taken from the amount transfered from the buyer to the owner.
  public because will be reused in this contract
  */
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
  }

  /*
  Same comments as transferFrom for public and not payable.
  Check if _to is a valid ERC721 receiver contract.
  HERE added "memory" to data location
  */
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory data) public override {
    transferFrom(_from, _to, _tokenId);

    //???
    uint32 size;
    assembly {
      size := extcodesize(_to)
    }

    if(size > 0){//if _to is a contract, not an externally owner address
      ERC721TokenReceiver receiver = ERC721TokenReceiver(_to);//where was declared this method ???
      require(receiver.onERC721Received(msg.sender, _from, _tokenId, data) == bytes4(keccak256("onERC721Received(address,address,uint256,bytes)")));
    }
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public override {
    safeTransferFrom(_from, _to, _tokenId, "");
  }

}

// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;
import "./standard/ERC721Metadata.sol";
import "./TokenManagerEnumerable.sol";

contract TokenManagerMetadataEnum is TokenManagerEnumerable, ERC721Metadata{
  string private __name;
  string private __symbol;
  bytes private __uriBase;//nexchange = neighbor exchange = next exchange = next change

  constructor(string memory _name, string memory _symbol, string memory _uriBase) public TokenManagerEnumerable(){
    __name = _name;
    __symbol = _symbol;
    __uriBase = bytes(_uriBase);

    //Add to ERC165 Interface Check
    //This is to notify that this contract implements ERC721Metadata
    supportedInterfaces[
      this.name.selector ^
      this.symbol.selector ^
      this.tokenURI.selector
    ] = true;//[0x5b5e139f]
  }

  function name() external view override returns (string memory _name){
    _name = __name;
  }

  function symbol() external view override returns (string memory _symbol){
    _symbol = __symbol;
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory){
    require(isValidToken(_tokenId));

    //prepare our tokenId's byte array
    uint maxLength = 78;//length of uint256
    bytes memory reversed = new bytes(maxLength);
    uint i = 0;

    //loop through and add byte values to the array
    while (_tokenId != 0) {
        uint remainder = _tokenId % 10;
        _tokenId /= 10;
        reversed[i++] = bytes1(uint8(48 + remainder));
    }

    //prepare the final array
    bytes memory s = new bytes(__uriBase.length + i);
    uint j;

    //concatenate
    //add the base to the final array
    for (j = 0; j < __uriBase.length; j++) {
        s[j] = __uriBase[j];
    }
    //add the tokenId to the final array
    for (j = 0; j < i; j++) {
        s[j + __uriBase.length] = reversed[i - 1 - j];
    }

    return string(s);
  }
}

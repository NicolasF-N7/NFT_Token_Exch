// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;
import "./standard/ERC721.sol";

contract CheckerERC165 is ERC165 {
  mapping (bytes4 => bool) internal supportedInterfaces;

  constructor() {
    supportedInterfaces[this.supportsInterface.selector] = true;
  }

  /*  interfaceID : the XOR of all function selectors in the interface
  supportsInterface uses less than 30k gas
  */
  function supportsInterface(bytes4 interfaceID) external view override returns (bool) {
    return supportedInterfaces[interfaceID];
  }
}

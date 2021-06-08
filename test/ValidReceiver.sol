// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;
import "../standard/ERC721TokenReceiver.sol";

contract ValidReceiver is ERC721TokenReceiver {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) external override returns(bytes4){
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }
}

// SPDX-License-Identifier: GPL-3.0-or-later
contract Wallet is ERC721TokenReceiver {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) external returns(bytes4){
        //Do stuff here
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }
}

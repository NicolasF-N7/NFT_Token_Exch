const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const fs = require('fs');
/*const provider = ganache.provider({
    gasLimit: 10000000
});*/
const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);

/*const compiledToken = require('../abi/TokenManager.abi');
const compiledValidReceiver = require('../abi/ValidReceiver.abi');
const compiledInvalidReceiver = require('../abi/InvalidReceiver.abi');*/
//const compiledTokenBC = JSON.stringify(JSON.parse(fs.readFileSync('bytecode/TokenManager.bc', 'UTF-8')).object);
//const compiledValidReceiver = fs.readFileSync('../abi/ValidReceiver.abi', 'UTF-8');
//const compiledInvalidReceiver = fs.readFileSync('../abi/InvalidReceiver.abi', 'UTF-8');

//Retrieving compiled contract from file, and extracting ABI & Bytecode
const compiledToken = require('../compiled/TokenManager.json');
let contractABI = compiledToken['abi'];
let contractByteCode = '0x'+compiledToken['evm'].bytecode.object;

let accounts;
let token;
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    let balance = await web3.eth.getBalance(accounts[0]);
    //console.log("Account[0] address: " + accounts[0] + ", balance: " + balance);
    token = await new web3.eth.Contract(contractABI)
        .deploy({
            data: contractByteCode,
            arguments: []
        }).send({from: accounts[0], gas: 1500000, gasPrice: '30000000000'});
    token.setProvider(provider); // Old way of doing??
});

describe('Token Contract', () => {
    //Initialisation
    it('Initialisation', async () => {
      const owner = accounts[0];
      const balance = await token.methods.balanceOf(owner).call();
      assert(balance == 0);
    });

    //Minting a token from creator
    it('Mint from creator', async () => {
      const owner = accounts[0];
      let balance = await token.methods.balanceOf(owner).call();
      await token.methods.mintToken().send({from: owner});
      balance = await token.methods.balanceOf(owner).call();
      assert(balance == 1);
    });

    //Minting a token from user
    it('Mint from user', async () => {
      const user = accounts[1];
      await token.methods.mintToken().send({from: user});
      const balance = await token.methods.balanceOf(user).call();
      assert(balance == 1);
    });

    //Minting & Burning a token from creator
    it('Burn from creator', async () => {
      const owner = accounts[0];
      await token.methods.mintToken().send({from: owner});
      const tokenId = 1;
      await token.methods.burnToken(tokenId).send({from: owner});

      const balance = await token.methods.balanceOf(owner).call();
      assert(balance == 0);
    });

    //Minting & Burning a token from user
    it('Burn from user', async () => {
      const user = accounts[1];
      await token.methods.mintToken().send({from: user});
      const tokenId = 1;
      await token.methods.burnToken(tokenId).send({from: user});

      const balance = await token.methods.balanceOf(user).call();
      assert(balance == 0);
    });

    //transferFrom a token from creator to user
    it('TransferFrom creator -> user', async () => {
      const owner = accounts[0];
      const user = accounts[1];
      await token.methods.mintToken().send({from: owner});
      const tokenId = 1;
      await token.methods.transferFrom(owner, user, tokenId).send({from: owner});

      const balance = await token.methods.balanceOf(user).call();
      assert(balance == 1);
    });

    //Transfer token when your balance is 0
    it('TransferFrom with token balance = 0', async () => {
      const owner = accounts[0];
      const user = accounts[1];
      const tokenId = 1;

      let success = false;
      try{
        await token.methods.transferFrom(owner, user, tokenId).send({from: owner});
        success = true;
      }catch(err){}

      assert(!success);
    });

    //Transfer token you don't own
    it('Transfer token you don\'t own', async () => {
      const owner = accounts[0];
      const user = accounts[1];
      await token.methods.mintToken().send({from: owner});
      const tokenId = 1;

      let success = false;
      try{
        await token.methods.transferFrom(user, owner, tokenId).send({from: user});
        success = true;
      }catch(err){}

      assert(!success);

    });

    //safeTransferFrom
    it('SafeTransferFrom creator -> user', async () => {
      const owner = accounts[0];
      const user = accounts[1];
      await token.methods.mintToken().send({from: owner});
      const tokenId = 1;
      await token.methods.safeTransferFrom(owner, user, tokenId).send({from: owner});

      const balance = await token.methods.balanceOf(user).call();
      assert(balance == 1);
    });

    //approve
    it('User approves the control of his token to owner', async () => {
      const owner = accounts[0];
      const user = accounts[1];
      await token.methods.mintToken().send({from: user});
      const tokenId = 1;
      await token.methods.approve(owner, tokenId).send({from: user});

      const approvedAddr = await token.methods.getApproved(tokenId).call();
      assert(approvedAddr == owner);
    });

    //Approved address transfer a token
    it('Approved user transfer a token he doesn\'t own', async () => {
      const owner = accounts[0];
      const user = accounts[1];
      const user2 = accounts[2];
      //Mint token
      await token.methods.mintToken().send({from: user});
      const tokenId = 1;
      //Set approve
      await token.methods.approve(user2, tokenId).send({from: user});
      //Approved user transfer token
      await token.methods.safeTransferFrom(user, owner, tokenId).send({from: user2});
      const balance = await token.methods.balanceOf(owner).call();
      assert(balance == 1);
    });

    //setApprovalForAll
    it('User1 grant ownership for all of his tokens to user2', async () => {
      const owner = accounts[0];
      const user = accounts[1];

      await token.methods.setApprovalForAll(user, true).send({from: owner});

      const approved = await token.methods.isApprovedForAll(owner, user).call();
      assert(approved);
    });

    //Authorised user transfer token of another user
    it('User2 (authorised by user1) transfer tokens of user1', async () => {
      const user1 = accounts[1];
      const user2 = accounts[2];
      const user3 = accounts[3];

      const tokenId1 = 1;
      await token.methods.mintToken().send({from: user1});

      await token.methods.setApprovalForAll(user2, true).send({from: user1});

      const tokenId2 = 2;
      await token.methods.mintToken().send({from: user1});

      await token.methods.safeTransferFrom(user1, user3, tokenId1).send({from: user2});
      await token.methods.safeTransferFrom(user1, user3, tokenId2).send({from: user2});
      const balance = await token.methods.balanceOf(user3).call();
      assert(balance == 2);
    });

});

const assert = require('assert');
const ganache = require('ganache-cli');
const fs = require('fs');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);

let compiledFilePath = './compiled/TokenManagerMetadataEnum.json';
let compiledToken = require(compiledFilePath);
let contractABI = compiledToken['abi'];

let accounts;
let contract;
let promise = web3.eth.getAccounts();
promise.then(function(response) {
  accounts = response;
}).then(function(res){
  let toknMngrMetadata = new web3.eth.Contract(contractABI, "0x7a3E9316D67DAF4E0b5c0a3Bf8A24e9A4B7A7eeF");
  //===Basic functions===
  //acc0 mint a token
  let rt = toknMngrMetadata.methods.mintToken().send({from: accounts[0], gas: 3000000, gasPrice: '30000000000'});

  //===Metadata functions===
  //Display the symbol from metadata
  toknMngrMetadata.methods.symbol().call().then(console.log);
  //print the tokenURI of the new token (ID=1)
  //.call because view function i.e. doesn't modify the contract state
  toknMngrMetadata.methods.tokenURI(1).call().then(console.log);

  //===Enumerable functions===
  toknMngrMetadata.methods.totalSupply().call().then(console.log);
  toknMngrMetadata.methods.tokenByIndex(0).call().then(console.log);
  toknMngrMetadata.methods.tokenOfOwnerByIndex(accounts[0],0).call().then(console.log);

  console.log("=Selector= Mint: " + web3.eth.abi.encodeFunctionSignature("mintToken()"));
  console.log("=Selector= totalSupply: " + web3.eth.abi.encodeFunctionSignature("totalSupply()"));
  console.log("=Selector= tokenByIndex: " + web3.eth.abi.encodeFunctionSignature("tokenByIndex(uint256)"));
  console.log("=Selector= tokenOfOwnerByIndex: " + web3.eth.abi.encodeFunctionSignature("tokenOfOwnerByIndex(address,uint256)"));
  console.log("=Selector= transferFrom: " + web3.eth.abi.encodeFunctionSignature("transferFrom(address,address,uint256)"));
  console.log("=Selector= burnToken: " + web3.eth.abi.encodeFunctionSignature("burnToken(uint256)"));
  console.log("=Selector= safeTransferFrom: " + web3.eth.abi.encodeFunctionSignature("safeTransferFrom(address,address,uint256)"));
  console.log("=Selector= balanceOf: " + web3.eth.abi.encodeFunctionSignature("balanceOf(address)"));

  //Set up event listener... Not working
  /*let evEmitter = toknMngrMetadata.events.Transfer().on('data',(event) =>{
    console.log("An event happened ! : " + event);
  }).on('error', (err) => {
    console.error("Event error...: " + err);
  });*/
});

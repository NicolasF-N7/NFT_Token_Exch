const assert = require('assert');
const ganache = require('ganache-cli');
const fs = require('fs');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);

let compiledFilePath = './compiled/TokenManagerEnumerable.json';
let compiledToken = require(compiledFilePath);
let contractABI = compiledToken['abi'];

let accounts;
let contract;
let promise = web3.eth.getAccounts();
promise.then(function(response) {
  accounts = response;
});

let toknMngrMetadata = new web3.eth.Contract(contractABI, "0x2da210d7403635d7ee5106a02ed0b37bba112b18");
//===Basic functions===
//acc0 mint a token
let rt = toknMngrMetadata.methods.mintToken().send({from: accounts[0], gas: 3000000, gasPrice: '30000000000'});

//===Metadata functions===
//Display the symbol from metadata
tokMngrMetadata.methods.symbol().call().then(console.log);
//print the tokenURI of the new token (ID=1)
//.call because view function i.e. doesn't modify the contract state
toknMngrMetadata.methods.tokenURI(1).call().then(console.log);

//===Enumerable functions===
toknMngrMetadata.methods.totalSupply().call().then(console.log);
toknMngrMetadata.methods.tokenByIndex(0).call().then(console.log);
toknMngrMetadata.methods.tokenOfOwnerByIndex(accounts[0],1).call().then(console.log);

//Set up event listener... Not working
let evEmitter = toknMngrMetadata.events.Transfer().on('data',(event) =>{
  console.log("An event happened ! : " + event);
}).on('error', (err) => {
  console.error("Event error...: " + err);
});

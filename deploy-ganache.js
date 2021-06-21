const assert = require('assert');
const ganache = require('ganache-cli');
const fs = require('fs');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
/*const provider = ganache.provider({gasLimit: 10000000});
const web3 = new Web3(provider);*/

let compiledFilePath = './' + process.argv[2];
console.log("Deploying " + compiledFilePath);
let compiledToken = require(compiledFilePath);
let contractABI = compiledToken['abi'];
let contractByteCode = '0x'+compiledToken['evm'].bytecode.object;

//FINALLY RETRIEVING ACCOUNT: OK
let accounts;
let contract;
let promise = web3.eth.getAccounts();
promise.then(function(response) {
  accounts = response;
}).then(function(res){
  //For TokenManager deployment, use arguments: []
  //For TokenManagerMetadata add the patams
  new web3.eth.Contract(contractABI).deploy({
          data: contractByteCode,
          arguments: [/*"Nexchange", "Nexchange symbol", "http://localhost/nexchange/tokens/"*/]
      }).send({from: accounts[0], gas: 3000000, gasPrice: '30000000000'}).then(function(res){
          contract = res;
          contract.setProvider(provider);
          console.log("Contract deployed at address " + contract.options.address + " by account " + accounts[0]);
      });
});

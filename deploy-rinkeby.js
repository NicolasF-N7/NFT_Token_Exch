const assert = require('assert');
const ganache = require('ganache-cli');
const fs = require('fs');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/f96a777fce0a4e30ad13544c52314cd5");
//const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
/*const provider = ganache.provider({gasLimit: 10000000});
const web3 = new Web3(provider);*/

async function main(){
  let compiledToken = require('./compiled/TokenManager.json');
  let contractABI = compiledToken['abi'];
  let contractByteCode = '0x'+compiledToken['evm'].bytecode.object;

  let deployerAccount = web3.eth.accounts.privateKeyToAccount("0xd4727bbc1d06be9363d5caf0bae5dad26dabe55d3ad1a6c368d3794d36920f09");
  console.log("Account address: " + deployerAccount.address);
  web3.eth.getGasPrice().then(function(res){console.log("Current gas price: " + res);});
  //let deployerAddress = "0x484d2b32e6BA7325C4A5909E8DC460A10B036F7F";
  let contract = new web3.eth.Contract(contractABI);

  //Create transaction object
  let rawTransaction = {
    "from": deployerAccount.address,
    "gas": 200000,
    "chain": "rinkeby",
    "hardfork": "petersburg"
  };
  //Sign transaction
  //let tx = await deployerAccount.signTransaction(rawTransaction).then(console.log);//Or equivalent below
  let tx;
  await web3.eth.accounts.signTransaction(rawTransaction, "0xd4727bbc1d06be9363d5caf0bae5dad26dabe55d3ad1a6c368d3794d36920f09")
  .then(function(res){
    console.log(res);
    tx = res;
  }).catch(e => {
    console.error('Error signing transaction...', e);
  })
  console.log("Signed ! " + tx.rawTransaction);
  //let serializedTx = '0x' + rawTransaction.serialize().toString('hex');
  //console.log("Tx serialized: " + serializedTx);
  let sentTx = await web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', console.log);;
  //web3.eth.sendSignedTransaction(tx)
}

main();


//Contract is here https://rinkeby.etherscan.io/tx/0xccae34fedd183674ccc2f08c9e4fe8ef432fe40c03c2eed16cd003deaf8c4193

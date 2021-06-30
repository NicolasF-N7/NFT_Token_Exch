const assert = require('assert');
const ganache = require('ganache-cli');
const fs = require('fs');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/f96a777fce0a4e30ad13544c52314cd5");
const web3 = new Web3(provider);

async function main(){
  //Retrieve contract's ABI
  let compiledToken = require('./compiled/TokenManagerMetadataEnum.json');
  let contractABI = compiledToken['abi'];
  let contractByteCode = '0x'+compiledToken['evm'].bytecode.object;
  //Create the account object who will deploy the contract.
  let deployerAccount = web3.eth.accounts.privateKeyToAccount("0xd4727bbc1d06be9363d5caf0bae5dad26dabe55d3ad1a6c368d3794d36920f09");
  console.log("Deployer account address: " + deployerAccount.address);
  web3.eth.getGasPrice().then(function(res){console.log("Current gas price: " + res);});
  //Get the contract with parameters ABI
  let contract = new web3.eth.Contract(contractABI);
  let deploy = contract.deploy({
          data: contractByteCode,
          arguments: ["Nexchange", "Nexchange symbol", "http://localhost/nexchange/tokens/"]
      }).encodeABI();
  //Create transaction object
  let rawTransaction = {
    from: deployerAccount.address,
    gas: 8000000,
    data: deploy,
    chain: "rinkeby",
    hardfork: "petersburg"
  };
  //Sign transaction
  //let tx = await deployerAccount.signTransaction(rawTransaction).then(console.log);//Or equivalent below
  let tx;
  await web3.eth.accounts.signTransaction(rawTransaction, "0xd4727bbc1d06be9363d5caf0bae5dad26dabe55d3ad1a6c368d3794d36920f09")
  .then(function(res){
    console.log("Signed ! ");
    console.log(res);
    tx = res;
  }).catch(e => {
    console.error('Error signing transaction...', e);
  })
  let sentTx = await web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', res => {
    console.log("Sent !");
    console.log(res);
  });
}
main();

//TokenManager Contract is here https://rinkeby.etherscan.io/tx/0xccae34fedd183674ccc2f08c9e4fe8ef432fe40c03c2eed16cd003deaf8c4193
//TokenManagerMetadataEnum: https://rinkeby.etherscan.io/tx/0xad23807fab5f376525a2f28fe6cedc3868dc790469ede6a93a41be38127a9e92
//Contract address: 0x83b33907de3469b030f058b06ba893e5352b5ec6

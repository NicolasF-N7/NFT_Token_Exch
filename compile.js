const path = require('path');
const fs = require('fs');
const solc = require('solc');

//const fileNameToCompile = 'InvalidReceiver';
//const fileNameToCompile = 'ValidReceiver';
//const tokMngrPath = path.resolve(__dirname, 'test', fileNameToCompile + '.sol');

const fileNameToCompile = 'TokenManager';
const tokMngrPath = path.resolve(__dirname, 'contracts', fileNameToCompile + '.sol');

console.log("File Path: " + tokMngrPath);
const source = fs.readFileSync(tokMngrPath, 'UTF-8');

//console.log(solc.compile(source, 1));
//Define the input JSON var for compiler
//Compiling and retrieving only ABI
let input = {
    language: 'Solidity',
    sources: {
        'sourceFile' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ 'abi', 'evm.bytecode'  ]
            }
        }
    }
};

function findImports(path) {
  //path = 'contracts/' + path
    console.log("findImports Importing: " + path);
    return {'contents': fs.readFileSync(path).toString()}
}

//Compiling
let output = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports}));

//Writing compiled file
let compiledFile = JSON.stringify(output.contracts["sourceFile"][fileNameToCompile]);
fs.writeFile("compiled/"+fileNameToCompile+".json", compiledFile, (err) => {
  if (err)
    console.log(err);
  else {
    console.log("ABI File written successfully\n");
    console.log("The written has the following contents:");
    console.log(fs.readFileSync("compiled/"+fileNameToCompile+".json", "utf8"));
  }
});

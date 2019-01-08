const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

//console.log(currentNodeUrl);
//Blockchain data structure
function Blockchain(){
  this.chain = [];
  this.pendingTransactions=[];
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  this.createNewBlock(100,'genesis','genesisBlock');
}

//create new Block
Blockchain.prototype.createNewBlock = function(nonce,prevBlockHash,hash){
  const newBlock = {
    index: this.chain.length+1,
    timeStamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    prevBlockHash: prevBlockHash
  };

  this.pendingTransactions=[];
  this.chain.push(newBlock);

  return newBlock;
}

//get last Blockchain
Blockchain.prototype.getLastBlock = function(){

  return this.chain[this.chain.length-1];

}

//create new Transaction
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient){
  const newTransaction = {
    amount: amount,
    sender: sender,
    receiver: recipient,
    transactionId:uuid().split('-').join('')
  }
  return newTransaction;
  
}
Blockchain.prototype.addTransactionToPendingTransaction = function(transaction){
  this.pendingTransactions.push(transaction);
  return this.getLastBlock()['index'] + 1;

}

//hash the block
Blockchain.prototype.hashBlock =  function(prevBlockHash,currentBlockData, nonce){

  const dataAsString = prevBlockHash + JSON.stringify(currentBlockData) + nonce.toString();
  const hash = sha256(dataAsString)

  return hash;

}

//proof of work
Blockchain.prototype.proofOfWork = function(prevBlockHash, currentBlockData){
  let nonce=0;
  let hash = this.hashBlock(prevBlockHash,currentBlockData,nonce)
  while(hash.substr(0,4) !== '0000'){
    hash = this.hashBlock(prevBlockHash, currentBlockData,++nonce);
  }
  //console.log(hash);
  return nonce;
}

Blockchain.prototype.chainIsValid = function(blockchain){
  let validChain = true;

  for(let i=1;i<blockchain.length;i++){
    const currentBlock = blockchain[i];
    const prevBlock= blockchain[i-1];

    const blockHash = currentBlock.hash;
    const calculatedHash = this.hashBlock(prevBlock.hash,{transactions : currentBlock.transactions,index: currentBlock.index}, currentBlock.nonce);

    if(currentBlock.hash !== calculatedHash) validChain = false;
    if(currentBlock.prevBlockHash !== prevBlock.hash) validChain = false;

    //verify genesis block
    /*

    */

    return validChain;


  }

}

Blockchain.prototype.getBlock = function(blockHash){
  let correctBlock= null;
  this.chain.forEach(block=>{
    if(block.hash === blockHash){
      correctBlock = block;
    }
  })

  return correctBlock;

}

Blockchain.prototype.getTransaction = function(transactionId){
  let correctTransaction = null;
  let correctBlock =null;
  this.chain.forEach(block=>{
    block.transactions.forEach(transaction=>{

      if(transaction.transactionId === transactionId){
        correctTransaction = transaction;
        correctBlock = block;
      }

    })

  })
  return {
    transaction: correctTransaction,
    block: correctBlock
  }
}


Blockchain.prototype.getAddress = function(address){
  const addressTransactions = [];
  let balance = 0;
  this.chain.forEach(block =>{
      block.transactions.forEach(transaction=>{
        if(transaction.sender === address || transaction.receiver === address) addressTransactions.push(transaction);
      })
  })
  
  addressTransactions.forEach(transaction=>{
      if (transaction.receiver === address) balance +=transaction.amount;
      else balance -=transaction.amount;
  })
  return {
    addressTransactions: addressTransactions,
    balance: balance
  }
}

//exporting the function constructor
module.exports = Blockchain;

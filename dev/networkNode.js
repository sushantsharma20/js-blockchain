const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rp = require('request-promise');
const port = process.argv[2];
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/blockchain', (req, res) =>{
  res.send(bitcoin);
} );

app.post('/transaction', (req, res) => {
  const transaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransaction(transaction);

  res.json({note :`Transaction will be added to block no--> ${blockIndex}`});
});

app.post('/transaction/broadcast',(req,res)=>{
  const transaction = bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
  bitcoin.addTransactionToPendingTransaction(transaction);
  const requestPromises =[];
  bitcoin.networkNodes.forEach(networkNodeUrl=>{
    const requestOptions ={
      uri:networkNodeUrl + '/transaction' ,
      method:'POST' ,
      body:transaction ,
      json:true
    };

    requestPromises.push(rp(requestOptions));
    }) ;

  Promise.all(requestPromises)
    .then(data=>{
      res.json({note: 'transaction created and broadcast successfully'});
    });
  
});

app.get('/mine', (req, res) =>{
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index:bitcoin.getLastBlock()['index'] + 1
  };
  //const pendingTransactions = JSON.stringify(bitcoin.pendingTransactions);
  const prevBlockHash=bitcoin.getLastBlock()['hash'];
  const nonce = bitcoin.proofOfWork(prevBlockHash,currentBlockData);
  const hash = bitcoin.hashBlock(prevBlockHash,currentBlockData,nonce);
  //bitcoin.createNewTransaction(12.5,'00',nodeAddress);
  const newBlock = bitcoin.createNewBlock(nonce, prevBlockHash,hash);
  const request_promises =[];
  bitcoin.networkNodes.forEach((networkNodeUrl)=>{
    const requestOptions = {
      uri:networkNodeUrl+'/receive-new-block',
      method:'POST',
      body:{newBlock: newBlock},
      json:true
    }
    
    request_promises.push(rp(requestOptions));
  });

  Promise.all(request_promises)
    .then(data=>{
      const requestOptions = {
        uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body:{
          amount: 12.5,
          sender:'00',
          recipient: nodeAddress
          },
        json: true
      }
      return rp(requestOptions);
    })
    .then(data=>{
      res.json({note: 'New Blockmined Successfully',
            block: newBlock
        });
    })

}) ;

app.post('/receive-new-block',(req,res)=>{

  const newBlock = req.body.newBlock;
  const lastBlock = bitcoin.getLastBlock();
  
  const correctHash =  lastBlock.hash === newBlock.prevBlockHash;
  const correctIndex = lastBlock.index+1 === newBlock.index;

  if(correctHash && correctIndex){
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.json({note: 'new block received and accepted',
              newBlock : newBlock});
  }else{
    res.json({note:'new block rejected',
              newBlock: newBlock });
  }

});

app.post('/register-and-broadcast-node',(req,res)=>{
  const newNodeUrl = req.body.newNodeUrl;
  if(bitcoin.networkNodes.indexOf(newNodeUrl) === -1){
    bitcoin.networkNodes.push(newNodeUrl);
  }

  const regNodePromises = [];
  bitcoin.networkNodes.forEach(networkNode =>{
    const requestOptions ={
      uri:networkNode + '/register-node' ,
      method:'POST' ,
      body:{newNodeUrl : newNodeUrl} ,
      json:true
    };

      regNodePromises.push(rp(requestOptions));

  });
      Promise.all(regNodePromises)
      .then(data =>{
          const bulkOptionReg = {
            uri : newNodeUrl+'/register-nodes-bulk',
            method: 'POST',
            body:{allNetworkNodes : [...bitcoin.networkNodes,bitcoin.currentNodeUrl]},
            json: true
          };

        return  rp(bulkOptionReg);
      }).then(data=>{
        res.json({note : 'New node registered successfully.'});
      })
      .catch(err=>console.log(err));
});

app.post('/register-node',(req,res)=>{
  newNodeUrl = req.body.newNodeUrl;

  if(bitcoin.networkNodes.indexOf(newNodeUrl) !== '-1' && bitcoin.currentNodeUrl !== newNodeUrl){
    bitcoin.networkNodes.push(newNodeUrl);
  }
  res.json({note: 'new node registered successfully'});
});

app.post('/register-nodes-bulk',(req,res)=>{
  const allNetworkNodes =  req.body.allNetworkNodes;
  allNetworkNodes.forEach((node)=>{
    if(bitcoin.networkNodes.indexOf(node) !== '-1' && bitcoin.currentNodeUrl !== node){
    bitcoin.networkNodes.push(node);
  }
  });

  res.json({note: 'bulk registration successfully'});
});

app.get('/consensus',(req,res)=>{   
  const request_promises =[];

  bitcoin.networkNodes.forEach(networkNodeUrl =>{
    const requestOptions={
      uri: networkNodeUrl + '/blockchain',
      method:'GET',
      json:true
    }
    request_promises.push(rp(requestOptions));
  })
  
  Promise.all(request_promises)
    .then(blockchains=>{
      const currentBlockchainLen = bitcoin.chain.length;
      let maxLenBlockchain = currentBlockchainLen;
      let maxBlockchain = null;
      var pendingTransactions = null
    
      blockchains.forEach(blockchain=>{
        const blockchainLen = blockchain.chain.length;
        if(blockchainLen > maxLenBlockchain) {
          maxLenBlockchain = blockchainLen;
          maxBlockchain = blockchain.chain;
          pendingTransactions = blockchain.pendingTransactions;
          
        }
      })
      if(!maxBlockchain || (maxBlockchain && !bitcoin.chainIsValid(maxBlockchain))){
          res.json({note: 'Current chain has not been replaced',
                    chain: bitcoin.chain});
          
        }else{
          bitcoin.chain = maxBlockchain;
          bitcoin.pendingTransactions = pendingTransactions;
          res.json({note: 'This chain has been replaces',
                    chain: bitcoin.chain
                  });
        }
      })  
      .catch(error=>{
        res.json({error: error.json},console.log(error));
      })
    

});

app.get('/address/:address',(req,res)=>{
  const address = req.params.address;
  const addressData = bitcoin.getAddress(address);

  if(addressData){
    res.json({
      addressTransactions: addressData.addressTransactions,
      balance: addressData.balance
    }) 
  }else {
    res.json({note: 'address not found'})
  }

})

app.get('/block/:blockHash',(req,res)=>{
  const blockHash = req.params.blockHash;
  const block = bitcoin.getBlock(blockHash);
  if(block){
      res.json({block: block})

  }else{
    res.json({note : `No block exist with hash ${blockHash}`})
  }
})

app.get('/transaction/:transactionId',(req,res)=>{

  const transaction = req.params.transactionId;
  const blockAndTransaction = bitcoin.getTransaction(transaction);

  if(blockAndTransaction){
    res.json({
      block: blockAndTransaction.block,
      transaction: blockAndTransaction.transaction
    })

  }

})

app.listen(port, () => console.log(`Blockchain node started on port ${port}!`))

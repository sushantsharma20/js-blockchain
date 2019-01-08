const Blockchain = require('./blockchain');


const bitcoin = new Blockchain();


const bc1= {
    "chain": [
    {
    "index": 1,
    "timeStamp": 1543956072998,
    "transactions": [],
    "nonce": 100,
    "hash": "genesisBlock",
    "prevBlockHash": "genesis"
    },
    {
    "index": 2,
    "timeStamp": 1543956154414,
    "transactions": [
    {
    "amount": 100,
    "sender": "EYDDN9F22DJHDA976264ALDN54das1d",
    "transactionId": "11fabc90f80511e8bd5b770ad7907862"
    }
    ],
    "nonce": 35592,
    "hash": "0000eb9430fbd876fd3a36e12f0bd9381a96bd16b8ca897ae7ebfffb83096d3b",
    "prevBlockHash": "genesisBlock"
    },
    {
    "index": 3,
    "timeStamp": 1543956162591,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "receiver": "f04d8550f80411e8bd5b770ad7907862",
    "transactionId": "20d7ab10f80511e8bd5b770ad7907862"
    },
    {
    "amount": 200,
    "sender": "DKAADSASSAASSA7A6264ALDN54das1d",
    "transactionId": "237d0180f80511e8bd5b770ad7907862"
    }
    ],
    "nonce": 10324,
    "hash": "0000c7128c34f90cb4c751b29f50f8fe71a0c290045439af5ca8d02b5509efe3",
    "prevBlockHash": "0000eb9430fbd876fd3a36e12f0bd9381a96bd16b8ca897ae7ebfffb83096d3b"
    },
    {
    "index": 4,
    "timeStamp": 1543956262452,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "receiver": "f04d8550f80411e8bd5b770ad7907862",
    "transactionId": "25b4c910f80511e8bd5b770ad7907862"
    },
    {
    "amount": 40,
    "sender": "POKASDASSASSAASSA7A6264ALDN54das1d",
    "transactionId": "55eab450f80511e8bd5b770ad7907862"
    },
    {
    "amount": 50,
    "sender": "POKASDASSASSAASSA7A6264ALDN54das1d",
    "transactionId": "58342f20f80511e8bd5b770ad7907862"
    },
    {
    "amount": 60,
    "sender": "POKASDASSASSAASSA7A6264ALDN54das1d",
    "transactionId": "5aca4350f80511e8bd5b770ad7907862"
    }
    ],
    "nonce": 48943,
    "hash": "00005af352f7e35193118c17d6bfa100e6e482a14482aa2127759727623ce338",
    "prevBlockHash": "0000c7128c34f90cb4c751b29f50f8fe71a0c290045439af5ca8d02b5509efe3"
    },
    {
    "index": 5,
    "timeStamp": 1543956272981,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "receiver": "f04d8550f80411e8bd5b770ad7907862",
    "transactionId": "613a5d60f80511e8bd5b770ad7907862"
    }
    ],
    "nonce": 222994,
    "hash": "0000b216394b8e08d6683bf740b6af5d699b7a9375e0543c83e14950fc8ec66c",
    "prevBlockHash": "00005af352f7e35193118c17d6bfa100e6e482a14482aa2127759727623ce338"
    },
    {
    "index": 6,
    "timeStamp": 1543956276327,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "receiver": "f04d8550f80411e8bd5b770ad7907862",
    "transactionId": "67811d80f80511e8bd5b770ad7907862"
    }
    ],
    "nonce": 51491,
    "hash": "000073e396b51cd3d7191e889b3727aa1c893a051a7d051a7790136614e0139b",
    "prevBlockHash": "0000b216394b8e08d6683bf740b6af5d699b7a9375e0543c83e14950fc8ec66c"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "receiver": "f04d8550f80411e8bd5b770ad7907862",
    "transactionId": "697f5e80f80511e8bd5b770ad7907862"
    }
    ],
    "currentNodeUrl": "http://localhost:3000",
    "networkNodes": []
    }

    const isValid = bitcoin.chainIsValid(bc1.chain);
    console.log(isValid);
var fs = require('fs');
const web3 = require('web3');
const Tx = require('ethereumjs-tx');

class ethService {
    constructor() {
        console.warn(process.env);
        this.myAddress = process.env.MAIN_ADDRESS;
        this.privateKey = Buffer.from(process.env.MAIN_PRIVATE_KEY, 'hex');
        let contractABI = JSON.parse(fs.readFileSync('/home/zenaclean/zenaclean-server/services/contract/abi.json'));
        this.contractAddress =process.env.CONTRACT_ADDRESS;
        this.web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/" 
            + process.env.INFURA_API_KEY));
        this.contract = new this.web3js.eth.Contract(contractABI,this.contractAddress);
    }

    getBalance(userAddress, cb, cb_err) {
        return this.contract.methods.balanceOf(userAddress).call()
            .then(balance => {
                console.log(balance)
                cb(balance)
            }).catch(cb_err)
    }

    doTransaction(toAddress) {
        this.web3js.eth.getTransactionCount(myAddress).then(function(count){
            //creating raw tranaction
            var amount = this.web3js.utils.toHex(1);
            var rawTransaction = { 
            "from": myAddress, 
            "gasPrice": this.web3js.utils.toHex(20 * 1e9), 
            "gasLimit": this.web3js.utils.toHex(210000), 
            "to": this.contractAddress,  
            "data": this.contract.methods.mintToken(toAddress, amount).encodeABI(), 
            "nonce": this.web3js.utils.toHex(count) 
            }

            //creating tranaction via ethereumjs-tx
            var transaction = new Tx(rawTransaction);
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via this.web3js module
            this.web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
            .on('transactionHash',console.log);
            
            //Calling balanceOf to see amount now
            contract.methods.balanceOf(myAddress).call()
            .then(function(balance){console.log(balance)});
        })
    }
}

module.exports = new ethService();

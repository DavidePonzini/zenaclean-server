const fs = require('fs');
const web3 = require('web3');
const Tx = require('ethereumjs-tx');
const debug = require('../util/util-debug');

const abi_path = '/home/zenaclean/zenaclean-server/services/contract/abi.json';

class ethService {
    constructor() {
        this.myAddress = process.env.MAIN_ADDRESS;
        this.privateKey = Buffer.from(process.env.MAIN_PRIVATE_KEY, 'hex');
        let contractABI = JSON.parse(fs.readFileSync(abi_path));
        this.contractAddress =process.env.CONTRACT_ADDRESS;
        this.web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/" + process.env.INFURA_API_KEY));
        this.contract = new this.web3js.eth.Contract(contractABI, this.contractAddress);
    }

    createUser() {
        let user = this.web3js.eth.accounts.create('ciao');
        return {
            address: user.address,
            privateKey: user.privateKey
        }
    }

    getBalance(userAddress, cb, cb_err) {
        return this.contract.methods.balanceOf(userAddress).call()
            .then(balance => {
                debug.log('BALANCE', balance);
                cb(balance)
            }).catch(cb_err)
    }

    createRawTransaction(toAddress, amount, type) {
        if(type === 'mint') {
            return {
                "from": this.myAddress, 
                "gasPrice": this.web3js.utils.toHex(20 * 1e9), 
                "gasLimit": this.web3js.utils.toHex(210000), 
                "to": this.contractAddress, 
                "data": this.contract.methods.mintToken(toAddress, amount).encodeABI(), 
                "nonce": this.web3js.utils.toHex(count) 
            }
        }
        else {
            return {
                "from": this.myAddress, 
                "gasPrice": this.web3js.utils.toHex(20 * 1e9), 
                "gasLimit": this.web3js.utils.toHex(210000), 
                "to": this.contractAddress, 
                "data": this.contract.methods.transfer(toAddress, amount).encodeABI(), 
                "nonce": this.web3js.utils.toHex(count) 
            }
        }
    }

    giveReward(toAddress, amount, cb, cb_err) {
        this.web3js.eth.getTransactionCount(this.myAddress).then(count => {
            //creating raw transaction
            const amount = this.web3js.utils.toHex(amount);
            const rawTransaction = this.createRawTransaction(toAddress, amount, 'mint');

            //creating transaction via ethereumjs-tx
            const transaction = new Tx(rawTransaction);
            transaction.sign(this.privateKey);

            //sending transaction via this.web3js module
            this.web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
            .on('transactionHash', (transaction) => {
                debug.log('REWARD', transaction)
            });
            
            //Calling balanceOf to see amount now
            //this.contract.methods.balanceOf(this.myAddress).call().then(function(balance){debug.log('REWARD', balance)});
        })
    }
}

module.exports = new ethService();

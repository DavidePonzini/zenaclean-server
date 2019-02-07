const fs = require('fs');
const web3 = require('web3');
const Tx = require('ethereumjs-tx');
const debug = require('../util/util-debug');

const abi_path = '/home/zenaclean/zenaclean-server/services/contract/abi.json';
const ropstenURL = 'https://ropsten.etherscan.io/';

class ethService {
    constructor() {
        this.myAddress = process.env.MAIN_ADDRESS;
        this.privateKey = Buffer.from(process.env.MAIN_PRIVATE_KEY, 'hex');
        let contractABI = JSON.parse(fs.readFileSync(abi_path));
        this.contractAddress =process.env.CONTRACT_ADDRESS;
        this.web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/" + process.env.INFURA_API_KEY));
        this.contract = new this.web3js.eth.Contract(contractABI, this.contractAddress);
        this.amount = 0;
        this.web3js.eth.getTransactionCount(this.myAddress).then(count => {
            this.count = count;
        });
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
                debug.log('BALANCE', `${userAddress} has ${balance} tokens`);
                cb(balance)
            }).catch(cb_err)
    }

    createRawTransaction(toAddress, amount, nonce, type) {
        if(type === 'mint') {
            return {
                "from": this.myAddress, 
                "gasPrice": this.web3js.utils.toHex(20 * 1e9), 
                "gasLimit": this.web3js.utils.toHex(210000), 
                "to": this.contractAddress, 
                "data": this.contract.methods.mintToken(toAddress, amount).encodeABI(), 
                "nonce": this.web3js.utils.toHex(nonce) 
            }
        }
        else {
            return {
                "from": this.myAddress, 
                "gasPrice": this.web3js.utils.toHex(20 * 1e9), 
                "gasLimit": this.web3js.utils.toHex(210000), 
                "to": this.contractAddress, 
                "data": this.contract.methods.transfer(toAddress, amount).encodeABI(), 
                "nonce": this.web3js.utils.toHex(nonce) 
            }
        }
    }

    giveReward(toAddress, amount) {
        debug.log('REWARD__', `${amount} --> ${ropstenURL}address/${toAddress}`);
        this.amount = amount;

        this.count = this.count + 1;
        debug.log('trans_count', this.count);

        //creating raw transaction
        const amount_hex = this.web3js.utils.toHex(this.amount);
        const rawTransaction = this.createRawTransaction(toAddress, amount_hex, this.count, 'mint');

        //creating transaction via ethereumjs-tx
        const transaction = new Tx(rawTransaction);
        transaction.sign(this.privateKey);

        //sending transaction via this.web3js module
        this.web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
        .on('transactionHash', (transaction) => {
            debug.log('REWARD', `tx hash: ${ropstenURL}tx/${transaction}`);
        }).catch(err => {
            debug.error('ETH TRANSACTION', err);
        });
    }
}

module.exports = new ethService();

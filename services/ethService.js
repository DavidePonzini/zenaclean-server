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
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/" + process.env.INFURA_API_KEY));
        this.contract = new this.web3js.eth.Contract(contractABI, this.contractAddress);
    }

    createUser() {
        let user = this.web3js.eth.accounts.create();
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

    toHex(value) {
        return this.web3js.utils.toHex(value);
    }

    createTransaction(reporter, reporter_amount, voters_addresses, voters_amount) {
        return this.web3js.eth.getTransactionCount(this.myAddress).then(count => {
            const reporter_amount_hex = this.toHex(reporter_amount);
            const voters_amount_hex = this.toHex(voters_amount);

            //TO FIX: this.myAddress need to be changed
            const reporter_address = reporter ? reporter : this.myAddress;

            return new Tx({
                "from": this.myAddress, 
                "gasPrice": this.toHex(20 * 1e9), 
                "gasLimit": this.toHex(8000029), 
                "to": this.contractAddress,
                "data": this.contract.methods
                    .drop(reporter_address, voters_addresses, reporter_amount_hex, voters_amount_hex)
                    .encodeABI(), 
                "nonce": this.toHex(count) 
            });
        });

    }

    giveReward(reporter, reporter_amount, voters, voters_amount) {
        //debug.log('REWARD', `giving reward: ${reporter_amount} to ${reporter}, ${voters_amount} to ${voters}`)
        this.createTransaction(reporter, reporter_amount, voters, voters_amount).then(transaction => {
                transaction.sign(this.privateKey);

                return this.web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                    .on('transactionHash', (transaction) => {
                        debug.log('REWARD', `tx hash: ${ropstenURL}tx/${transaction}`);
                    });
            }).catch(err => {
                debug.error('ETH TRANSACTION', err);
            });
    }
}

module.exports = new ethService();

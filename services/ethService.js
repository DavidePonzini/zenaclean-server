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
            return this.web3js.eth.getBlock("latest", (error, blockResult) => {
                return this.web3js.eth.getGasPrice((err, gasResult) => {
                    const gasPrice = gasResult*1.40;
                    const reporter_amount_hex = this.toHex(reporter_amount);
                    const voters_amount_hex = this.toHex(voters_amount);

                    debug.log('REWARD', gasPrice);
                    debug.log('REWARD', blockResult.gasLimit);
                    //TO FIX: this.myAddress need to be changed
                    const reporter_address = reporter ? reporter : this.myAddress;

                    var transaction = new Tx({
                        "from": this.myAddress, 
                        "gasPrice": this.toHex(gasPrice), 
                        "gasLimit": this.toHex(blockResult.gasLimit), 
                        "to": this.contractAddress,
                        "data": this.contract.methods
                            .drop(reporter_address, voters_addresses, reporter_amount_hex, voters_amount_hex)
                            .encodeABI(), 
                        "nonce": this.toHex(count) 
                    });
                    transaction.sign(this.privateKey);
                    return this.web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                        .on('transactionHash', (transaction) => {
                            debug.log('REWARD', `tx hash: ${ropstenURL}tx/${transaction}`);
                        });
                });
            });
        });
    }

    giveReward(reporter, reporter_amount, voters, voters_amount) {
        //debug.log('REWARD', `giving reward: ${reporter_amount} to ${reporter}, ${voters_amount} to ${voters}`)
        this.createTransaction(reporter, reporter_amount, voters, voters_amount).then(transaction => {
                debug.log('ETH TRANSACTION', transaction);
            }).catch(err => {
                debug.error('ETH TRANSACTION', err);
            });
    }
}

module.exports = new ethService();

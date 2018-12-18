'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
	email: {
		type: String,
		required: 'Name'
	},
	ssn: {
		type: String,
		required: 'SSN'
	},
	password:{
		type: String,
		required: 'Password'
	}
}, {collection: 'users'});

module.exports = mongoose.model('User' , User, 'users');

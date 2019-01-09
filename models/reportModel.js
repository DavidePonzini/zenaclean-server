'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Report = new Schema({
	title: {
		type: String,
		required: true
    },
	timestamp:{
        type: String,
        required: true
    },
	latitude:{
        type: Number,
        required: true
    },
	longitude:{
        type: Number,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    description: String,
    url: String,
    user_id: {
	    type: String,
        required: true
    },
    votes_positive: [{user: String}],
    votes_negative: [{user: String}],
}, {collection: 'reports'});

module.exports = mongoose.model('Report' , Report, 'reports');

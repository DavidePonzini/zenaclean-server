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
    description:{
        type: String,
    },
    url:{
        type: String,
        required: true
    },
    user_id: {
	    type: String,
        required: true
    }
}, {collection: 'reports'});

module.exports = mongoose.model('Report' , Report, 'reports');

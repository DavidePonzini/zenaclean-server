'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Report = new Schema({
	title: {
		type: String,
		required: 'Title'
    },
	timestamp:{
        type: String,
        required: 'Timestamp'
    },
	latitude:{
        type: Number,
        required: 'Longitude'
    },
	longitude:{
        type: Number,
        required: 'Longitude'
    },
    address:{
            type: String,
            required: 'Address'
    },
    description:{
            type: String,
            required: 'Description'
    },
    url:{
        type: String,
        required: 'URL picture'
    }
}, {collection: 'reports'});

module.exports = mongoose.model('Report' , Report, 'reports');

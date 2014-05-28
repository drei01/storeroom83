/**
 * Created by: dhayes on 4/8/14.
 * Filename: models/storerooms.js
 */
var logger = require('../logger'),
    mongoose = require('mongoose'),
    merge = require('mongoose-merge-plugin'),
	textSearch = require('mongoose-text-search'),
    timestamp = require('mongoose-timestamp');

mongoose.plugin(merge);

var StoreroomSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    controlAccount: {type: String},
    costAdjAccount: {type: String},
    receiptVarAccount: {type: String},
    purchaseVarAccount: {type: String},
    shrinkageAccount: {type: String},
    invoiceVarAccount: {type: String},
    currencyVarAccount: {type: String},
    useInPurchasing: {type: Boolean, default: true}
});

StoreroomSchema.plugin(timestamp);
StoreroomSchema.plugin(textSearch);

StoreroomSchema.index({ "$**": "text" });

StoreroomSchema.pre('save', function(next) {
    var self = this;
    if (!self.isNew) {
        return next();
    } else {
        mongoose.models["Storeroom"].findOne({name : self.name},function(err, storeroom) {
            if (err) return next(err);
            if (storeroom) {
                return next(new Error("Storeroom name must be unique"));
            } else {
                return next();
            }
        });
    }
});

mongoose.model('Storeroom', StoreroomSchema);






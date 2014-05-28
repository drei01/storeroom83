/**
 * Created by: dhayes on 4/8/14.
 * Filename: routes/vendors.js
 */
var logger = require('../logger'),
    mongoose = require('mongoose'),
    config = require('../configuration'),
    auth = require('../configuration/auth'),
    Vendor = mongoose.model('Vendor'),
    Item = mongoose.model('Item');

module.exports = function(app) {
    app.get('/api/purchasing/vendors', auth.ensureAuthenticated, function(req, res, next) {
        Vendor.find({}, function(err, vendors) {
            if (err) return next(err);
            res.json(200, vendors);
        });
    });

    app.get('/api/purchasing/vendors/new', auth.ensureAuthenticated, function(req, res) {
        res.json(200, new Vendor());
    });

    app.get('/api/purchasing/vendors/:id', auth.ensureAuthenticated, function(req, res, next) {
        Vendor.findById(req.params.id, function(err, vendor) {
            if (err) return next(err);
            res.json(200, vendor);
        });
    });

    app.delete('/api/purchasing/vendors/:id', auth.ensureAuthenticated, function(req, res, next) {
        var id = req.params.id;
        Vendor.findByIdAndRemove(id, function(err, vendor) {
            if (err) return next(err);
            res.json(200);
        });
    });

    app.post('/api/purchasing/vendors', auth.ensureAuthenticated, function(req, res, next) {
        Vendor.create(req.body, function(err, newVendor) {
            if (err) return next(err);
            res.json(200, newVendor);
        });
    });

    app.put('/api/purchasing/vendors/:id', auth.ensureAuthenticated, function(req, res, next) {
        Vendor.findById(req.params.id, function(err, vendor){
            if (err) return next(err);
            vendor.merge(req.body);

            vendor.save(function(err, updatedVendor){
                if (err) return next(err);

                // Update any vendorParts.vendor objects in items collection
                // consider creating an event and placing the following code in that event...
                var v = {
                    _id: updatedVendor._id,
                    code: updatedVendor.code,
                    name: updatedVendor.name
                };
                Item.update({'vendorParts.vendor._id': updatedVendor._id}, { $set: { "vendorParts.$.vendor" : v }}, { multi: true}, function(err, updated){
                    if (err) return next(err);

                    logger.debug('Updated '+updated+' items with updated vendor information');
                    res.json(200, updatedVendor);
                });
            });
        });
    });

    app.post('/api/purchasing/vendors/_search', function(req, res, next) {
		if(req.body.query.query_string.all){
			Vendor.find({}, function(err, vendors) {
				if (err) return next(err);
				res.json(200, vendors);
			});
		}else{
			Vendor.textSearch(req.body,function (err, output) {
				if(err){
					return next(err);
				}

				res.json(200, output);
			});
		}
    });

};

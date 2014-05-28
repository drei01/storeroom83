/**
 * Created by: dhayes on 4/8/14.
 * Filename: routes/storerooms.js
 */
var logger = require('../logger'),
    mongoose = require('mongoose'),
    config = require('../configuration'),
    auth = require('../configuration/auth'),
    Storeroom = mongoose.model('Storeroom'),
    Inventory = mongoose.model('Inventory');

module.exports = function(app) {
    app.get('/api/inventory/storerooms', auth.ensureAuthenticated, function(req, res, next) {
        Storeroom.find({}, function(err, storerooms) {
            if (err) return next(err);
            res.json(200, storerooms);
        });
    });

    app.get('/api/inventory/storerooms/new', auth.ensureAuthenticated, function(req, res) {
        res.json(200, new Storeroom());
    });

    app.get('/api/inventory/storerooms/:id', auth.ensureAuthenticated, function(req, res, next) {
        Storeroom.findById(req.params.id, function(err, storeroom) {
            if (err) return next(err);
            res.json(200, storeroom);
        });
    });

    app.delete('/api/inventory/storerooms/:id', auth.ensureAuthenticated, function(req, res, next) {
        var id = req.params.id;
        Storeroom.findByIdAndRemove(id, function(err, storeroom) {
            if (err) return next(err);
            res.json(200);
        });
    });

    app.post('/api/inventory/storerooms', auth.ensureAuthenticated, function(req, res, next) {
        Storeroom.create(req.body, function(err, newStoreroom) {
            if (err) return next(err);
            res.json(200, newStoreroom);
        });
    });

    app.put('/api/inventory/storerooms/:id', auth.ensureAuthenticated, function(req, res, next) {
        Storeroom.findById(req.params.id, function(err, storeroom){
            if (err) return next(err);
            storeroom.merge(req.body);

            storeroom.save(function(err, updatedStoreroom){
                if (err) return next(err);
                // Update any inventory.item objects in inventories collection
                // consider creating an event and placing the following code in that event...
                var storeroom = {
                    _id: updatedStoreroom._id,
                    name: updatedStoreroom.name,
                    description: updatedStoreroom.description
                };
                Inventory.update({'storeroom._id': updatedStoreroom._id}, { $set: { "storeroom" : storeroom }}, { multi: true}, function(err, updated){
                    if (err) return next(err);

                    logger.debug('Updated '+updated+' inventory with updated storeroom information');
                    res.json(200, updatedStoreroom);
                });
            });
        });
    });

    app.post('/api/inventory/storerooms/_search', function(req, res, next) {
		if(req.body.query.query_string.all){
			Storeroom.find({}, function(err, storerooms) {
				if (err) return next(err);
				res.json(200, storerooms);
			});
		}else{
			Storeroom.textSearch(req.body.query.query_string.query,function (err, output) {
				if(err){
					return next(err);
				}

				res.json(200, output);
			});
		}
    });

};

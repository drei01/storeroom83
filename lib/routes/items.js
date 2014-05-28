/**
 * Created by: dhayes on 4/8/14.
 * Filename: routes/items.js
 */
var logger = require('../logger'),
    mongoose = require('mongoose'),
    config = require('../configuration'),
    auth = require('../configuration/auth'),
    Item = mongoose.model('Item'),
    Inventory = mongoose.model('Inventory'),
    _ = require('lodash');

module.exports = function(app) {
    app.get('/api/inventory/items', auth.ensureAuthenticated, function(req, res, next) {
        Item.find({}, function(err, items) {
            if (err) return next(err);
            res.json(200, items);
        });
    });

    app.get('/api/inventory/items/new', auth.ensureAuthenticated, function(req, res) {
        res.json(200, new Item());
    });

    app.get('/api/inventory/items/:id', auth.ensureAuthenticated, function(req, res, next) {
        Item.findById(req.params.id, function(err, item) {
            if (err) return next(err);
            res.json(200, item);
        });
    });

    app.delete('/api/inventory/items/:id', auth.ensureAuthenticated, function(req, res, next) {
        var id = req.params.id;
        Item.findOneAndRemove(id, function(err, item) {
            if (err) return next(err);
            res.json(200);
        });
    });

    app.post('/api/inventory/items', auth.ensureAuthenticated, function(req, res, next) {
        Item.create(req.body, function(err, newitem) {
            if (err) return next(err);
            res.json(200, newitem);
        });
    });

    app.put('/api/inventory/items/:id', auth.ensureAuthenticated, function(req, res, next) {
        Item.findById(req.params.id, function(err, item){
            if (err) return next(err);
            item.merge(req.body);

            item.save(function(err, updatedItem){
                if (err) return next(err);
                // Update any inventory.item objects in inventories collection
                // consider creating an event and placing the following code in that event...
                var item = {
                    _id: updatedItem._id,
                    partNumber: updatedItem.partNumber,
                    description: updatedItem.description
                };

                Inventory.update({'item._id': updatedItem._id}, { $set: { "item" : item }}, { multi: true}, function(err, updated){
                    if (err) return next(err);

                    logger.debug('Updated '+updated+' inventory with updated item information');
                    res.json(200, updatedItem);
                });
            });
        });
    });

    app.post('/api/inventory/items/_search', function(req, res, next) {
		if(req.body.query.query_string.all){
			Item.find({}, function(err, items) {
				if (err) return next(err);
				res.json(200, items);
			});
		}else{
			Item.textSearch(req.body,function (err, output) {
				if(err){
					return next(err);
				}

				res.json(200, output);
			});
		}
    });

};

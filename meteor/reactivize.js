'use strict';

var setup = function () {
	var templateInstance = this;
	// `this` is a template instance that can store properties of our choice - http://docs.meteor.com/#/full/template_inst
	if (templateInstance.setupDone) return;  // only run setup once
	// this.data is the data context - http://docs.meteor.com/#/full/template_data
	// normalize all options into templateInstance.options
	templateInstance.options = templateInstance.data.options || {};
	Object.keys(templateInstance.data).forEach(function (key) {
		if (key === 'options' || key === 'items') return;
		templateInstance.options[key] = templateInstance.data[key];
		delete templateInstance.data[key];
	});
	templateInstance.collection = this.data.items.collection || this.data.items || this.data.collection || this.data;
	// TODO array
	delete templateInstance.data.options;

	// emulate what {{#each}} does for a falsey value - nothing
	// if (!items) return;

	/*if (!(collection instanceof Meteor.Collection)) {
		if (Array.isArray(collection)) {
			// collection is an array
			// create a new collection from the data
			var data = collection;
			collection = new Meteor.Collection(null);
			_.each(data, function (doc) {
				collection.insert(doc);
			});
		} else if (typeof collection.fetch !== 'undefined') {
			// collection is a cursor
			// create a new collection that will reactively update
			var cursor = collection;
			collection = new Meteor.Collection(null);
			var addedCallback = function (doc) {
				collection.insert(doc);
			};
			var changedCallback = function (doc, oldDoc) {
				collection.update(oldDoc._id, doc);
			};
			var removedCallback = function (oldDoc) {
				collection.remove(oldDoc._id);
			};
			cursor.observe({added: addedCallback, changed: changedCallback, removed: removedCallback});
		} else {
      throw new Meteor.Error(500, '{{#sortable}} currently only accepts arrays, cursors or falsey values.')
			console.log("Sortable error: argument is not an instance of Meteor.Collection, a cursor, or an array");
			collection = new Meteor.Collection(null);
		}
	}
	this.data.collection = collection; */

	templateInstance.setupDone = true;
	console.log('Sortable initialized');

};

Template.sortable.created = setup;

Template.sortable.helpers({

	'setup': function () {
		console.log('setup helper');
		setup.call(Template.instance());
	}
});



Template.sortable.rendered = function () {
  var templateInstance = this;
	setup.call(templateInstance);

	console.log('Rendered');

	// TODO do we need to call setup from 3 places?
	var optionsOnStart = templateInstance.options.onStart;
	templateInstance.options.onStart = function (event) {
		var itemEl = event.item;  // dragged HTMLElement
		// var id = event.item.getAttribute('data-id');
		event.data = Blaze.getData(itemEl);
		//console.log('Blaze object', bla);
		templateInstance.startOrder = event.data[templateInstance.options.sortField];
		console.log('Started to drag order %s = ', templateInstance.startOrder, event.data);
		if (optionsOnStart) optionsOnStart(event);
	};

/*	templateInstance.options.onEnd = function (event) {
		console.log('onEnd');
		var itemEl = event.item;  // dragged HTMLElement
		var id = event.item.getAttribute('data-id');
		var bla = Blaze.getData(itemEl);
		console.log('Blaze object', bla);
		templateInstance.end = Blaze.getData(itemEl);
		console.log('Ended drag at order #', templateInstance.end);
		//if (optionsOnStart) optionsOnStart();
	};*/

	// templateInstance.options.onUpdate = templateInstance.options.onStart;

	var optionsOnSort = this.options.onSort;
	templateInstance.options.onSort = function (event) {
		var itemEl = event.item;  // dragged HTMLElement
		var orderField = templateInstance.options.sortField;
		var selector = {}, modifier = {$inc: {}};
		event.data = Blaze.getData(itemEl);
		// TODO different lists
		// Update the order in the collection. We want to minimize the number of updated records.
		// Using an "arithmetic mean" strategy like differential.com/blog/sortable-lists-in-meteor-using-jquery-ui
		// will eventually (after <50 updates) result in the order being lost due to floating point
		// precision limits. As such, we'll increase or decrease the intervening records between the
		// oldIndex and the newIndex. TODO: we may be able to update fewer records by only altering the
		// order of the records before/after newIndex/oldIndex.
		if (event.newIndex < event.oldIndex) {
			// Element moved up in the list. Increase the order of intervening elements.
			// The dropped element has a nextSibling for sure
			var orderNextItem = Blaze.getData(itemEl.nextElementSibling)[orderField];
			selector[orderField] = {$gte: orderNextItem, $lt: templateInstance.startOrder};
			modifier.$inc[orderField] = 1;
			// TODO fucked, multi doesn't work on the client
			console.log('Items.update(%s, %s, {multi: true})', JSON.stringify(selector), JSON.stringify(modifier));
			templateInstance.collection.update(selector, modifier, {multi: true});
			// set the order of the dropped element to be just below the order of its successor
			modifier = {$set: {}};
			modifier.$set[orderField] = orderNextItem;
			console.log('Items.update("%s", %s)', event.data._id, JSON.stringify(modifier));
			templateInstance.collection.update(event.data._id, modifier);
		} else if (event.newIndex > event.oldIndex) {
			// Element farther down in the list. Decrease the order of intervening elements.
			// The dropped element has a previous sibling for sure
			var orderPrevItem = Blaze.getData(itemEl.previousElementSibling)[orderField];
			selector[orderField] = {$lte: orderPrevItem, $gt: templateInstance.startOrder};
			modifier.$inc[orderField] = -1;
			// TODO fucked, multi doesn't work on the client
			console.log('Items.update(%s, %s, {multi: true})', JSON.stringify(selector), JSON.stringify(modifier));
			templateInstance.collection.update(selector, modifier, {multi: true});
			// set the order of the dropped element to be just below the order of its successor
			modifier = {$set: {}};
			modifier.$set[orderField] = orderPrevItem;
			console.log('Items.update("%s", %s)', event.data._id, JSON.stringify(modifier));
			templateInstance.collection.update(event.data._id, modifier);
		} else {
			// do nothing - drag and drop in the same location
		}
		console.log('onSort %s -> %s', event.oldIndex, event.newIndex);
		if (optionsOnSort) optionsOnSort(event);
	};

	this.sortable = new Sortable(this.firstNode.parentElement, templateInstance.options);

};

Template.sortable.destroyed = function () {
	this.sortable.destroy();
};

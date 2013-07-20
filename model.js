/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var NodeModel = require('./lib/NodeModel');

	function model (root, options) {

		options = Object.create(options);

		if (!options.selector) options.selector = qsa;

		var rdom = new NodeModel(root, options);

		// TODO: support path property on change objects
		// TODO: also support changes property to compare to path

		return {
			update: function (changes) {
				// changes is an array of objects: { type, object, name [, oldValue] }
				// type can be "new", "deleted", "updated", or "reconfigured"
				var model = {};
				// collapse changes
				changes.forEach(function (change) {
					var prop = change.object[change.name];
					model[prop] = change.object[prop];
				});
				return rdom.updateModel(model);
			},
			set: function (all) {
				return rdom.setModel(all);
			},
			get: function () {
				return rdom.getModel();
			},
			find: function (nodeOrEvent) {
				return rdom.findModel(nodeOrEvent);
			},
			clear: function () {
				return rdom.clearModel();
			}
		};
	}

	return model;

	function qsa (node, selector) {
		return node.querySelectorAll(selector);
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

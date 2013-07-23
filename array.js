/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var NodeArray = require('./lib/NodeArray');

	/**
	 * Binds a dom node to data.
	 * @param {HTMLElement} root
	 * @param {Object} options @see {NodeArray}
	 * @return {Object} with a push(updates) function and a pull() function.
	 */
	function array (root, options) {

		options = Object.create(options || null);

		if (!options.identify) {
			options.identify = createIdentifyForProperty(options.id || 'id');
		}
		if (!options.compare) {
			options.compare = createCompareForProperty(options.sortBy || 'id');
		}

		var rdom = new NodeArray(root, options);

		// TODO: support path property on change objects
		// TODO: also support changes property to compare to path
		// Note: array.splice(n, ...) causes array.length-n+1 change records!


		return {
			update: function (changes) {
				// changes is an array of objects: { type, object, name [, oldValue] }
				// type can be "new", "deleted", "updated", or "reconfigured"
				changes.forEach(function (change) {
					var model;

					if (!Array.isArray(change.object)) throw new Error('Change record is not for an array.');
					if (isNaN(change.name)) return;

					model = change.object[change.name];

					if ('new' == change.type) {
						rdom.insertModel(model);
					}
					else if ('deleted' == change.type) {
						rdom.deleteModel(change.oldValue);
					}
					else if ('updated' == change.type) {
						rdom.updateModel(model, change.oldValue);
					}

				}, this);
			},
			set: function (all) {
				return rdom.setArray(all);
			},
			find: function (nodeOrEvent) {
				return rdom.findModel(nodeOrEvent);
			},
			clear: function () {
				return rdom.clearModel();
			}
		};
	}

	return array;

	function createIdentifyForProperty (prop) {
		return function (obj) { return Object(obj)[prop]; };
	}

	function createCompareForProperty (prop) {
		return function (a, b) {
			return compare(Object(a), Object(b), prop);
		};
	}

	function compare (a, b, prop) {
		return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

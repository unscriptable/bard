(function (define) {
define(function (require) {

	var Reactive = require('./lib/Reactive');

	/**
	 * Binds a dom node to data.
	 * @param {HTMLElement} root
	 * @param {Object} options @see {Reactive}
	 * @return {Object} with a push(updates) function and a pull() function.
	 */
	function reactive (root, options) {

		if (!options) options = {};
		if (!options.selector) options.selector = qsa;
		if (!options.identify) {
			options.identify = options.id
				? createIdentifyByProperty(options.id)
				: identity;
		}
		if (!options.compare) {
			options.compare = createCompareByProperty(options.sortBy || 'id');
		}

		var rdom = new Reactive(root, options);

		return {
			updateModel: function (changes) {
				return rdom.update(changes);
			},
			setModel: function (all) {
				return rdom.set(all);
			},
			findItem: function (nodeOrEvent) {
				return rdom.findItem(nodeOrEvent);
			}
		};
	}

	return reactive;

	function identity (obj) { return obj; }

	function createIdentifyByProperty (propName) {
		return function (obj) { return Object(obj)[propName]; };
	}

	function createCompareByProperty (propName) {
		return function (a, b) {
			a = Object(a);
			b = Object(b);
			return a[propName] < b[propName]
				? -1
				: a[propName] > b[propName] ? 1 : 0;
		};
	}

	function qsa (node, selector) {
		return node.querySelectorAll(selector);
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
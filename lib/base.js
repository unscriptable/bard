/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var dom = require('./dom');
	var accessor = require('./proxy/native');

	return {

		sectionAttr: 'data-bard-section',

		pushData: function (binding, options) {
			var model, missing, transform;
			model = binding.model;
			missing = options && options.missing;
			transform = options && options.transform || noop;
			binding.push(function (key) {
				// get value
				return transform(accessor.get(model, key, missing), key);
			});
		},

		pullData: function (binding, options) {
			var model = binding.model;
			binding.pull(function (key, value) {
				// set value, creating hierarchy, if needed
				accessor.construct(model, key, value);
			});
		},

		createAccessors: function (binding, options) {
			var accessors;
			accessors = this.binder(binding.node);
			binding.push = accessors.push;
			binding.pull = accessors.pull;
			return binding;
		},

		containsNode: function (refNode, testNode) {
			return dom.contains(refNode, testNode);
		},

		findSectionNode: function (rootNode, options) {
			var scope, query;
			scope = options.sectionName;
			query = '[' + options.sectionAttr
				+ (scope ? '="' + scope + '"' : '')
				+ ']';
			return options.qsa(rootNode, query)[0]
				|| options.qsa(rootNode, 'ul,ol,tbody,dl')[0];
		},

		binder: function () {
			throw new Error('No binder specified.');
//		},
//
//		cloneModel: function (model) {
//			return Object.keys(model).reduce(function (clone, key) {
//				clone[key] = model[key];
//				return clone;
//			}, {});
		}

	};

	function noop (val) {
		return val;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

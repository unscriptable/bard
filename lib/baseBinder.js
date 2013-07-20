/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var dom = require('./dom');
	var extractBindings = require('./extractBindings');
	var createAccessors = require('./createAccessors');
	var jsonPath = require('./jsonPath');

	return {

		sectionAttr: 'data-bard-section',

		pushData: function (binding, options) {
			var model, missing, transform;
			model = binding.model;
			missing = options && options.missing;
			transform = options && options.transform || noop;
			binding.push(function (key) {
				// get value
				return transform(jsonPath.get(model, key, missing), key);
			});
		},

		pullData: function (binding, options) {
			var model = binding.model;
			binding.pull(function (key, value) {
				// set value, creating hierarchy, if needed
				jsonPath.construct(model, key, value);
			});
		},

		createAccessors: function (binding, options) {
			var bindings, accessors;
			bindings = extractBindings(binding.node, options);
			accessors = createAccessors(bindings, options);
			binding.push = accessors.push;
			binding.pull = accessors.pull;
			return binding;
		},

		containsNode: function (refNode, testNode) {
			return dom.contains(refNode, testNode);
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

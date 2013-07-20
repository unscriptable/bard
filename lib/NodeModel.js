/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var baseBinder = require('./baseBinder');
	var dom = require('./dom');

	function NodeModel (rootNode, options) {
		var topSection;

		options = Object.create(options);

		if (!options.selector) options.selector = dom.qsa;
		if (!options.sectionAttr) options.sectionAttr = baseBinder.sectionAttr;

		topSection = options.selector(rootNode, '[' + options.sectionAttr + '="' + options.sectionName + '"]')[0] || rootNode;

		this.rootNode = rootNode;
		this.sectionNode = topSection;
		this.options = options;

		this.binding = {
			model: null,
			node: topSection
		};
		// binding = { model, node, push, pull }

	}

	NodeModel.prototype = {

		updateModel: function (model) {
			var model, p;

			if (!this.binding.model) this.setModel({});
			model = this.binding.model;

			Object.keys(model).forEach(function (p) {
				model[p] = model[p];
			});

			this.pushData(this.binding, this.options);
		},

		setModel: function (model) {
			this.clearModel();

			this.binding.model = model;

			this.createAccessors(this.binding, this.options);

			// push model into the dom
			this.pushData(this.binding, this.options);

		},

		/**
		 * Returns the model with updated properties from bound values
		 * from the dom.
		 * @return {Object}
		 */
		getModel: function () {
			if (!this.binding.model) this.binding.model = {};
			if (!this.binding.pull) {
				this.createAccessors(this.binding, this.options);
			}
			this.pullData(this.binding, this.options);
			return this.binding.model;
		},

		clearModel: function () {
			if (this.binding.model) {
				this.binding.model = null;
				this.pushData(this.binding, {
					missing: this.options.missing || defaultToBlank,
					transform: this.options.transform || defaultToBlank
				});
			}
		},

		findModel: function (nodeOrEvent) {
			var node, binding;
			node = dom.toNode(nodeOrEvent);
			binding = this.binding;
			return this.containsNode(binding.node, node)
				? binding.model
				: null;
		},

		pushData: baseBinder.pushData,

		pullData: baseBinder.pullData,

		createAccessors: baseBinder.createAccessors,

		containsNode: baseBinder.containsNode
	};

	return NodeModel;

	function defaultToBlank (val) {
		return val == null ? '' : val;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

(function (define) {
define(function (require) {

	var baseBinder = require('./baseBinder');
	var dom = require('./dom');

	function NodeModel (rootNode, options) {
		var topSection, itemNode;

		options = Object.create(options);

		if (!options.selector) options.selector = dom.qsa;
		if (!options.sectionAttr) options.sectionAttr = baseBinder.sectionAttr;

		topSection = options.selector(rootNode, '[' + options.sectionAttr + '="' + options.sectionName + '"]')[0] || rootNode;

		this.rootNode = rootNode;
		this.sectionNode = topSection;
		this.options = options;

		this.binding = {
			data: null,
			node: topSection
		};
		// binding = { data, node, push, pull }

	}

	NodeModel.prototype = {

		update: function (changes) {
			// TODO: support path property on change objects
			// TODO: also support changes property to compare to path
			// changes is an array of objects: { type, object, name [, oldValue] }
			// type can be "new", "deleted", "updated", or "reconfigured"
			if (!this.binding.data) this.binding.data = {};

			changes.forEach(function (change) {
				var prop = change.object[change.name];
				this.binding.data[prop] = change.object[prop];
			}, this);

			this.pushData(this.binding, this.options);
		},

		set: function (model) {
			this.clear();

			this.binding.data = model;

			this.createAccessors(this.binding, this.options);

			// push data into the dom
			this.pushData(this.binding, this.options);

		},

		get: function () {
			if (!this.binding.data) this.binding.data = {};
			if (!this.binding.pull) {
				this.createAccessors(this.binding, this.options);
			}
			this.pullData(this.binding, this.options);
			return this.binding.data;
		},

		clear: function () {
			if (this.binding.data) {
				this.binding.data = null;
				this.pushData(this.binding, {
					missing: this.options.missing || defaultToBlank,
					transform: this.options.transform || defaultToBlank
				});
			}
		},

		findItem: function (nodeOrEvent) {
			var node, binding;
			node = dom.toNode(nodeOrEvent);
			binding = this.binding;
			return this.containsNode(binding.node, node)
				? binding.data
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

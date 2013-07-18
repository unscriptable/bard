(function (define) {
define(function (require) {

	var extractBindings = require('./extractBindings');
	var createAccessors = require('./createAccessors');
	var jsonPath = require('./jsonPath');
	var dom = require('./dom');

	var sectionAttr = 'data-bard-section';

	function NodeModel (rootNode, options) {
		var topSection, itemNode;

		this.selector = options.selector || dom.qsa;

		topSection = this.selector(rootNode, '[' + sectionAttr + '="' + options.sectionName + '"]')[0] || rootNode;

		this.rootNode = rootNode;
		this.sectionNode = topSection;
		this.options = options;

		this.binding = null;
		// binding = { data, node, push, pull }

	}

	NodeModel.prototype = {

		update: function (changes) {

			// TODO: support path property on change objects
			// TODO: also support changes property to compare to path
			// changes is an array of objects: { type, object, name [, oldValue] }
			// type can be "new", "deleted", "updated", or "reconfigured"
			changes.forEach(function (change) {
				var prop = change.object[change.name];
				this.binding.data[prop] = change.object[prop];
			}, this);

			this.pushData(this.binding);
		},

		set: function (model) {
			var newBinding, bindings, accessors;

			this.clear();

			newBinding = this.binding = {
				data: model,
				node: this.sectionNode
			};

			bindings = extractBindings(newBinding.node, this.options);
			accessors = createAccessors(bindings, this.options);
			newBinding.push = accessors.push;
			newBinding.pull = accessors.pull;

			// push data into the dom
			this.pushData(newBinding);

		},

		findItem: function (nodeOrEvent) {
			var node, binding;
			node = dom.toNode(nodeOrEvent);
			binding = this.binding;
			return this.containsNode(binding.node, node)
				? binding.data
				: null;
		},

		pushData: function (binding) {
			var model = binding.data;
			binding.push(function (key) {
				// get value
				return jsonPath.get(model, key);
			});
		},

		containsNode: function (refNode, testNode) {
			return dom.contains(refNode, testNode);
		}

	};

	return NodeModel;

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
(function (define) {
define(function (require) {

	var extractBindings = require('./extractBindings');
	var createAccessors = require('./createAccessors');
	var jsonPath = require('./jsonPath');
	var dom = require('./dom');

	var sectionAttr = 'data-bard-section';

	function NodeModel (rootNode, options) {
		var topSection, itemNode;

		options = Object.create(options);
		if (!options.selector) options.selector = dom.qsa;

		topSection = options.selector(rootNode, '[' + sectionAttr + '="' + options.sectionName + '"]')[0] || rootNode;

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
			// TODO: what do we do if this is called before set()? (this.binding == null)
			// TODO: support path property on change objects
			// TODO: also support changes property to compare to path
			// changes is an array of objects: { type, object, name [, oldValue] }
			// type can be "new", "deleted", "updated", or "reconfigured"
			changes.forEach(function (change) {
				var prop = change.object[change.name];
				this.binding.data[prop] = change.object[prop];
			}, this);

			this.pushData(this.binding, this.options);
		},

		set: function (model) {
			var bindings, accessors;

			this.clear();

			this.binding.data = model;

			bindings = extractBindings(this.binding.node, this.options);
			accessors = createAccessors(bindings, this.options);
			this.binding.push = accessors.push;
			this.binding.pull = accessors.pull;

			// push data into the dom
			this.pushData(this.binding, this.options);

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

		pushData: function (binding, options) {
			var model, missing, transform;
			model = binding.data;
			missing = options && options.missing;
			transform = options && options.transform || noop;
			binding.push(function (key) {
				// get value
				return transform(jsonPath.get(model, key, missing), key);
			});
		},

		containsNode: function (refNode, testNode) {
			return dom.contains(refNode, testNode);
		}

	};

	return NodeModel;

	function defaultToBlank (val) {
		return val == null ? '' : val;
	}

	function noop (val) {
		return val;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
(function (define) {
define(function (require) {

	var baseBinder = require('./baseBinder');
	var dom = require('./dom');

	/**
	 * Binds a dom node to data.
	 * @constructor
	 * @param {HTMLElement} rootNode
	 * @param {Object} options
	 * @param {String} [options.sectionName] is the name of the topmost list
	 *   section under rootNode, if the top section is an array.
	 * @param {Function} options.identify is a function that returns a unique
	 *   identifier for an object.  The returned value does not have to be a
	 *   string.
	 * @param {Function} options.compare is a function that compares two
	 *   objects to determine their sort order and should return -1, 0, or 1.
	 * @param {Function} options.selector is a query selector
	 *   function like jQuery(selector) or dojo.query(selector).
	 * @param {Array} [options.cssBindings] (TODO) if omitted, assumes data-bard-bind
	 *   and data-bard-section attributes in the dom describe the bindings.
	 * @param {Boolean} [options.preserve] should be set to truthy
	 *   to leave the data-bard-bind attrs in the dom after processing
	 *   a node tree.
	 */
	function NodeArray (rootNode, options) {
		var topSection, modelNode;

		options = Object.create(options);

		if (!options.selector) options.selector = dom.qsa;
		if (!options.sectionAttr) options.sectionAttr = baseBinder.sectionAttr;

		topSection = options.selector(rootNode, '[' + options.sectionAttr + '="' + options.sectionName + '"]')[0] || rootNode;

		// yank out the contents from top section and use it as a template.
		// if there are no sections, use the root node.
		// TODO: support dom fragments and legacy browsers that don't have firstElementChild
		modelNode = topSection.removeChild(topSection.firstElementChild);

		this.rootNode = rootNode;
		this.sectionNode = topSection;
		this.modelNode = modelNode;
		this.options = options;

		this.bindings = [];
		// binding = { model, node, push, pull }

	}

	NodeArray.prototype = {

//		updateArray: function (array) {
//			// TODO: figure out if the model is new or existing
//			array.forEach(function (model) {
//				this.updateModel(model);
//			}, this);
//		},

		setArray: function (array) {
			this.clearModel();
			array.forEach(function (model) {
				this.insertModel(model);
			}, this);
		},

		findModel: function (nodeOrEvent) {
			var node, model;
			node = dom.toNode(nodeOrEvent);
			model = null;
			// if this node isn't in our tree, bail early
			if (!this.containsNode(this.rootNode, node)) return model;
			// for each top-level model, compare position.
			// the cost of not using attribute turds is that we must loop
			// through all possible nodes.
			// TODO: use poly/array array.find()
			this.bindings.some(function (binding) {
				if (this.containsNode(binding.node, node)) {
					return model = binding.model;
				}
			}, this);
			return model;
		},

		insertModel: function (model) {
			var newBinding, newPos;

			newBinding = {
				model: model,
				node: this.modelNode.cloneNode(true)
			};

			newPos = this.sortedPos(model);

			this.bindings.splice(newPos, 0, newBinding);

			this.insertModelNode(newBinding.node, newPos);

			this.createAccessors(newBinding, this.options);

			// push model into the dom
			this.pushData(newBinding, this.options);

			return model;
		},

		updateModel: function (newModel, oldModel) {
			var binding, oldPos, newPos;

			oldPos = this.exactPos(oldModel);
			newPos = this.sortedPos(newModel);

			binding = this.bindings[oldPos];
			binding.model = newModel;

			this.bindings.splice(newPos, 0, binding);
			this.bindings.splice(oldPos, 1);

			this.insertModelNode(binding.node, newPos);

			// push model into the dom
			this.pushData(binding, this.options);

			return newModel;
		},

		deleteModel: function (oldModel) {
			var oldPos, oldBinding;

			oldPos = this.exactPos(oldModel);
			oldBinding = this.bindings[oldPos];

			this.bindings.splice(oldPos, 1);

			this.deleteModelNode(oldBinding.node);

			return oldModel;
		},

		clearModel: function () {
			this.bindings.forEach(function (binding) {
				this.deleteModelNode(binding.node);
			}, this);
			this.bindings = [];
		},

		sortedPos: function (model) {
			var compare, bindings, pos;
			compare = this.options.compare;
			bindings = this.bindings;
			return this.binarySearch(
				0,
				this.bindings.length,
				function (pos) { return compare(bindings[pos].model, model); }
			);
		},

		exactPos: function (model) {
			var compare, identify, bindings, approx, id;
			compare = this.options.compare;
			identify = this.options.identify;
			bindings = this.bindings;
			approx = this.sortedPos(model);
			id = identify(model);
			return this.gropeSearch(
				approx,
				0,
				this.bindings.length,
				function (pos) { return identify(bindings[pos].model) === id; },
				function (pos) { return compare(bindings[pos].model, model); }
			);
		},

		insertModelNode: function (modelNode, pos) {
			var sibling, siblingNode;
			// find previous sibling (undefined is ok)
			sibling = this.bindings[pos - 1];
			siblingNode = sibling && sibling.node;
			// insert node into dom
			this.sectionNode.insertBefore(modelNode, siblingNode);
			return modelNode;
		},

		deleteModelNode: function (modelNode) {
			this.sectionNode.removeChild(modelNode);
			return modelNode;
		},

		pushData: baseBinder.pushData,

		pullData: baseBinder.pullData,

		createAccessors: baseBinder.createAccessors,

		containsNode: baseBinder.containsNode,

		binarySearch: binarySearch,

		gropeSearch: grope

	};

	return NodeArray;

	/**
	 * Searches through a list of items, looking for the correct slot
	 * position for an item.
	 * @param {Number} min points at the first possible slot
	 * @param {Number} max points at the slot after the last possible slot
	 * @param {Function} compare is a function to determine how well the
	 *   current position is correct. must return a number, but only cares if
	 *   the number is positive, negative, or zero.
	 * @returns {Number} returns the slot where the item should be placed
	 *   into the list.
	 */
	function binarySearch (min, max, compare) {
		var mid, diff;
		if (max <= min) return min;
		do {
			mid = Math.floor((min + max) / 2);
			diff = compare(mid);
			// if we've narrowed down to a choice of just two slots
			if (max - min <= 1) {
				return diff == 0 ? mid : diff > 0 ? max : min;
			}
			// don't use mid +/- 1 or we may miss in-between values
			if (diff > 0) min = mid;
			else if (diff < 0) max = mid;
			else return mid;
		}
 		while (true);
	}

	/**
	 * Gropes around a given position in a list to find an exact item.  Uses
	 * the match function to determine if it has a match.  Uses the proximal
	 * function to know if it has groped too far.
	 * @param {Number} approx
	 * @param {Number} min points at the first possible slot
	 * @param {Number} max points at the slot after the last possible slot
	 * @param {Function} match must return true if the item at given position
	 *   is an exact match.
	 * @param {Function} proximal is a function to determine how well the
	 *   current position is correct. must return a number, but only cares if
	 *   the number is positive, negative, or zero.
	 * @return {Number}
	 */
	function grope (approx, min, max, match, proximal) {
		var offset = 1, low, high, tooHigh, tooLow;

		if (match(approx)) return approx;

		do {
			high = approx + offset;
			tooHigh = tooHigh || high >= max;
			if (!tooHigh) {
				if (match(high)) return high;
				tooHigh = proximal(high) > 0;
			}
			low = approx - offset;
			tooLow = tooLow || low < min;
			if (!tooLow) {
				if (match(low)) return low;
				tooLow = proximal(low) < 0;
			}
			offset++;
		}
		while (!tooHigh || !tooLow);

		return -1;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

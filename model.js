(function (define) {
define(function (require) {

	var NodeModel = require('./lib/NodeModel')

	function model (root, options) {

		if (!options) options = {};
		if (!options.selector) options.selector = qsa;

		var rdom = new NodeArray(root, options);

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
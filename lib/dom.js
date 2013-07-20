/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function () {

	var containsImpl = getContainsImpl;

	/**
	 * Reused dom helper functions.
	 * @type {Object}
	 */
	var dom = {

		/**
		 * Returns true if refNode contains testNode in its hierarchy.
		 * @param {Node} refNode
		 * @param {Node} testNode
		 * @return {Boolean}
		 */
		contains: function (refNode, testNode) {
			return containsImpl(refNode, testNode);
		},

		/**
		 * Test if nodeOrEvent is a node or an event.  If it's an event, it
		 * returns the event's target. Otherwise, it returns the node.
		 * @param {Node|Event} nodeOrEvent
		 * @return {Node}
		 */
		toNode: function (nodeOrEvent) {
			var node;
			node = 'nodeName' in nodeOrEvent && 'nodeType' in nodeOrEvent
				? nodeOrEvent
				: nodeOrEvent.target || nodeOrEvent.srcElement;
			return node;
		},

		qsa: function (node, selector) {
			return node.querySelectorAll(selector);
		}

	};

	return dom;

	/**
	 * Determines the DOM method used to compare the relative positions
	 * of DOM nodes and returns an abstraction function.
	 * @private
	 * @return {Function} function (refNode, testNode) { return boolean; }
	 */
	function getContainsImpl () {
		if (typeof document != 'undefined' && document.compareDocumentPosition) {
			// modern browser
			containsImpl = function (refNode, testNode) {
				return (refNode.compareDocumentPosition(testNode) & 16) == 16;
			};
		}
		else {
			// assume legacy IE
			containsImpl = function (refNode, testNode) {
				return refNode.contains(testNode);
			};
		}
		return containsImpl.apply(null, arguments);
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));

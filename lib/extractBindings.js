/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var bardAttr = 'data-bard-bind';
	var sectionAttr = 'data-bard-section';

	/**
	 * Finds nodes with data-bard-bind attrs and returns an array of objects
	 * with a node property and a mappings array of "attr:template" strings.
	 * @param {HTMLElement} root is a node tree.
	 * @param {Object} options
	 * @param {Boolean} [options.preserve] should be set to truthy
	 *   to leave the data-bard-bind attrs in the dom after processing
	 *   a node tree.
	 * @param {Function} [options.selector] is a query selector
	 *   function like jQuery(selector) or dojo.query(selector).  If
	 *   omitted, the browser's querySelectorAll function is used.
	 * @return {Array}
	 */
	function extractBindings (root, options) {
		var nodes, convert;

		nodes = findBardNodes(root, options.selector);
		if (options.preserve) {
			convert = function (node) {
				var b = createBindings(node);
				removeBindingAttrs(node);
				return b;
			}
		}
		else {
			convert = createBindings;
		}

		return nodes.map(convert);
	}

	return extractBindings;

	function findBardNodes (root, selector) {
		var nodes;

		nodes = selector(root, '[' + bardAttr + '],[' + sectionAttr + ']');
		// TODO: we need poly/array to support Array.from:
		nodes = Array.prototype.slice.call(nodes);

		// selectors don't check the root node
		if (root.getAttribute(bardAttr) != null || root.getAttribute(sectionAttr) != null) {
			nodes.unshift(root);
		}

		return nodes;
	}

	// data-bard-bind="attr1:template1;attr2:template2"
	// data-bard-section="name"

	function createBindings (node) {
		var bardDef, isTextNode;

		bardDef = node.getAttribute(bardAttr);

		if (bardDef) {
			isTextNode = bardDef.indexOf('text:') >= 0;
			return {
				node: isTextNode ? replaceWithTextNode(node) : node,
				bind: bardDef.split(';').map(splitPair)
			}
		}
		else {
			return {
				node: checkRedundantSection(node),
				section: node.getAttribute(sectionAttr)
			}
		}
	}

	function removeBindingAttrs (node) {
		node.removeAttribute(bardAttr);
		node.removeAttribute(sectionAttr);
	}

	function splitPair (pair) { return pair.split(':'); }

	function replaceWithTextNode (node) {
		var parent, text;

		// switch element with a text node
		parent = node.parentNode;
		text = node.ownerDocument.createTextNode('');

		parent.insertBefore(text, node);
		parent.removeChild(node);

		return text;
	}

	/**
	 * TODO: this feels hacky. we should fix this in the parse step, imho.
	 *
	 * Removes a data-bard-section node if it has no siblings.  It returns
	 * the node's parent instead.  Rationale: a data-bard-section node
	 * as an only child probably means that the dev intended the parent
	 * to be the section root, but there is no way to indicate that with
	 * mustache-style template tags.
	 * @private
	 * @param {HTMLElement} sectionNode
	 * @return {HTMLElement} parent or sectionNode
	 */
	function checkRedundantSection (sectionNode) {
		var parent, node, type;

		parent = sectionNode.parentNode;

		if (parent) {
			node = parent.firstChild;
			while (node) {
				type = node.nodeType;
				// if there is a peer element
				if (type == 1) return sectionNode;
				// if this is a non-blank text node
				else if (type == 3) {
					if (!/\S+/.test(node.data)) return sectionNode;
				}
				node = node.nextSibling;
			}
		}

		parent.removeChild(sectionNode);

		return parent;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

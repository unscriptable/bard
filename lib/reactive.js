/** @license MIT License (c) copyright B Cavalier & J Hann */
(function (define) {
define(function (require) {

	var simpleTemplate = require('./simpleTemplate');

	var reactAttr = 'data-domo-reactpoint';

	/**
	 * Finds nodes with data-domo-reactpoint attrs and returns a map of
	 * accessor functions.  For each data-domo-reactpoint key found, there
	 * is a property in the map that has the following properties:
	 *   {HTMLElement} node
	 *   {String} attr
	 *   TODO: change this to function (key) { return 'a string'; }
	 *   {Function} updater (calls options.transform(key))
	 * and may have (if not a templated data-domo-reactpoint):
	 *   {Function} getter (returns the value)
	 *   {String} key
	 * @param {HTMLElement} root is a node tree.
	 * @param {Object} options
	 * @param {Boolean} [options.preserveAttrsd] should be set to truthy
	 *   to leave the data-domo-reactpoint attrs in the dom after processing
	 *   a node tree.
	 * @param {Function} [options.replacer] is a function that transforms
	 *   a data-domo-reactpoint attr's key to a value:
	 *   function (key){ return 'a string'; }
	 * @param {Function} [options.querySelectorAll] is a query selector
	 *   function like jQuery(selector) or dojo.query(selector).  If
	 *   omitted, the browser's querySelectorAll function is used.
	 * @return {Object}
	 */
	function reactive (root, options) {
		var qsa;
		qsa = options.querySelectorAll || querySelectorAll;
		return createPushPull(findReactPoints(root, qsa), options);
	}

	return reactive;

	function findReactPoints (root, qsa) {
		var nodes;
		nodes = qsa(root, '[' + reactAttr + ']');
		// TODO: we need poly/array to support Array.from:
		nodes = Array.prototype.slice.call(nodes);
		// qsa doesn't check the root node
		if (root.getAttribute(reactAttr) != null) {
			nodes.unshift(root);
		}
		return nodes;
	}

	function querySelectorAll (node, selector) {
		return node.querySelectorAll(selector);
	}

	// data-domo-reactpoint="attr1:template1;attr2:template2"

// TODO: separate finding of dom nodes (and conversion to text nodes) with creation of push/pull
	function createPushPull (nodes, options) {
		var extractors, injectors;

		extractors = [];
		injectors = [];

		nodes.forEach(function (node) {
			var reactDef, pairs;

			reactDef = node.getAttribute(reactAttr);
			if (!options.preserveAttrs) {
				node.removeAttribute(reactDef);
			}
			pairs = reactDef.split(';');

			pairs.forEach(function (pair) {
				var parts, attr, compiled, setter, point;

				parts = pair.split(':', 2);
				attr = parts[0];

				if ('text' == attr) {
					// elements that have a "text:" data-domo-reactpoint.
					// switch element with a text node
					// TODO: throw if "text:" is combined with anything else?
					// TODO: is there a better place to switch nodes?
					node = replaceWithTextNode(node);
				}

				compiled = simpleTemplate.compile(parts[1]);
				if (compiled.length > 1) {
					injectors.push(createTemplateUpdater(node, attr, compiled));
				}
				else {
					injectors.push(createSetter(node, attr, compiled[0].key));
					extractors.push(createGetter(node, attr, compiled[0].key));
				}
			});
		});

		return {
			push: function (provider) {
				for (var i = 0; i < injectors.length; i++) injectors[i](provider);
			},
			pull: function (receiver) {
				for (var i = 0; i < extractors.length; i++) extractors[i](receiver);
			}
		}
	}

	function createTemplateUpdater (node, attr, compiled) {
		var setter = createSetter(node, attr);
		return function (provider) {
			var content = simpleTemplate.exec(compiled, provider);
			setter(function () { return content; });
		};
	}

	function createSetter (node, attr, key) {
		if ('text' == attr) attr = 'data';
		else if ('html' == attr) attr = 'innerHTML';
		return attr in node
			? function (provider) { node[attr] = provider(key); }
			: function (provider) { node.setAttribute(attr, provider(key)); }
	}

	function createGetter (node, attr, key) {
		if ('text' == attr) attr = 'data';
		else if ('html' == attr) attr = 'innerHTML';
		return attr in node
			? function (receiver) { receiver(key, node[attr]); }
			: function (receiver) { receiver(key, node.getAttribute(attr)); }
	}

	function replaceWithTextNode (node) {
		var parent, text;
		// switch element with a text node
		parent = node.parentNode;
		text = node.ownerDocument.createTextNode('');
		parent.insertBefore(text, node);
		parent.removeChild(node);
		return text;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
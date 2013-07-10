/** @license MIT License (c) copyright B Cavalier & J Hann */
(function (define) {
define(function (require) {

	var replaceTokens = require('./replaceTokens');
	var jsonPath = require('./jsonPath');

	var parentTypes, parents, getFirstTagNameRx, isPlainTagNameRx;

	// elements that could be used as root nodes and their natural parent type.
	parentTypes = {
		'li': 'ul',
		'td': 'tr',
		'tr': 'tbody',
		'tbody': 'table',
		'thead': 'table',
		'tfoot': 'table',
		'caption': 'table',
		'col': 'table',
		'colgroup': 'table',
		'option': 'select'
	};

	parents = {};

	getFirstTagNameRx = /<\s*(\w+)/;
	isPlainTagNameRx = /^[A-Za-z]\w*$/;

	/**
	 * Constructs a DOM node and child nodes from a template string.
	 * Information contained in a hashmap is merged into the template
	 * via tokens (${key} or {{key}}) before rendering into DOM nodes.
	 * A plain tag name (e.g. "div", "li", "thead") can be used instead
	 * of a template if only a single element is desired.
	 * @param {String} template is an html template.
	 * @param {Object} options
	 * @param {Object} [options.dictionary] is a string replacements hash.
	 * @param {Function} [options.transform] is a transform function.
	 * @param {Function} [options.replace] is a string replacement function:
	 *   function () {}
	 * @returns {HTMLElement}
	 */
	function render (template, options) {
		var el;

		if (!options.replace) {
			options.replace = replaceTokens;
			if (!options.transform) options.transform = function (key) {
				var val = jsonPath(options.dictionary, key);
				return typeof val == 'undefined' ? '' : val;
			}
		}

		// replace tokens (before attempting to find top tag name)
		template = options.replace('' + template, options);

		if (isPlainTagNameRx.test(template)) {
			// just 'div' or 'a' or 'tr', for example
			el = document.createElement(template);
		}
		else {
			// create node from template
			el = ElementFromTemplate(template);
		}

		return el;
	}

	return render;

	/**
	 * Creates an element from a text template.  This function does not
	 * support multiple elements in a template.  Leading and trailing
	 * text and/or comments are also ignored.
	 * @private
	 * @param {String} template
	 * @returns {HTMLElement} the element created from the template
	 */
	function ElementFromTemplate (template) {
		var parentName, parent, first, child;

		parentName = getFirstTagName(template);
		parent = parentElement(parentName);
		parent.innerHTML = template;

		// we just want to return first element (nodelists
		// are tricky), so we loop through all top-level children to ensure
		// we only have one.
		// TODO: start using document fragments to handle multiple elements?

		// try html5-ish API
		first = parent.firstElementChild;
		child = parent.lastElementChild;

		// old dom API
		if (!first) {
			child = parent.firstChild;
			while (child) {
				if (child.nodeType == 1 && !first) {
					first = child;
				}
				child = child.nextSibling;
			}
		}

		if (first != child) {
			throw new Error('render() only supports one top-level element per template.');
		}

		return first;
	}

	/**
	 * Finds the first html element in a string, extracts its tag name.
	 * @private
	 * @param {String} template
	 * @returns {String} the parent tag name, or 'div' if none was found.
	 */
	function getFirstTagName (template) {
		var matches;
		matches = template.match(getFirstTagNameRx);
		return matches && matches[1];
	}

	/**
	 * Creates a parent element for the given HTML tag.  Parent elements are
	 * cached and reused.  Creation of a parent element might recursively
	 * cause other parent elements to be created and cached (e.g. tables).
	 * @private
	 * @param {String} tagName
	 * @return {String}
	 */
	function parentElement (tagName) {
		var parentType, parent;
		tagName = tagName.toLowerCase();
		parentType = parentTypes[tagName] || 'div';
		console.log('parentType', parentType);
		parent = parents[parentType];
		if (!parent) {
			parent = parents[parentType] = document.createElement(parentType);
			if (parentType != 'div') {
				parentElement(parentType).appendChild(parent);
			}
		}
		console.log('parent', parent);
		return parent;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
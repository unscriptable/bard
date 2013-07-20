/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function () {

	var findIdentifiersRx, isIdentifierRx, undef;

	findIdentifiersRx = /(?:\.|^)([a-zA-Z$_][a-zA-Z0-9$_]*)|\["(.*?[^\\])"\]|\['(.*?[^\\])'\]|\[(\d+)\]/g;
	isIdentifierRx = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/;

	return {
		get: get,
		set: set,
		construct: construct,
		parse: parse,
		propsToPath: propsToPath,
		safeProp: safeProp
	};

	/**
	 * Gets a value within a complex Object/Array structure using
	 * json-path-like syntax.  A path in the following form:
	 *   'items[1].thing'
	 * will navigate to the 2nd "thing" property in this structure:
	 *   { items: [ { thing: 'foo' }, { thing: 'bar' } ] }
	 * The path could also be written in these other ways:
	 *   'items.1.thing'
	 *   'items[1]["thing"]'
	 * If the jsonPath specifies a property that cannot be navigated,
	 * the missing parameter is called.  If there is no missing parameter,
	 * an Error is thrown.
	 * @param {Object|Array} obj an arbitrarily complex structure of Object
	 *   and Array types.
	 * @param {String} path is a jsonPath descriptor of a property in obj.
	 * @param {Function} missing is a function that provides a value when
	 *   the property or some part of the hierarchy is missing.
	 * @return {*}
	 */
	function get (obj, path, missing) {
		var props, value;
		props = parse(String(path));
		value = getFromPath(Object(obj), props);
		if (props.length > 0) {
			if (missing) return missing(path);
			else prematureEnd(path);
		}
		return value;
	}

	/**
	 * Sets a value within a complex Object/Array structure using
	 * jsonPath-like syntax.  If the jsonPath specifies a property that
	 * cannot be navigated, an Error is thrown.
	 * @param {Object|Array} obj an arbitrarily complex structure of Object
	 *   and Array types.
	 * @param {String} path is a jsonPath descriptor of a property in obj.
	 * @param {*} [value] sets the value of the property described
	 *   by path.
	 * @return {*}
	 */
	function set (obj, path, value) {
		var props, last;
		props = parse(String(path));
		last = props.pop();
		obj = getFromPath(obj, props, arguments[3]);
		if (undef !== obj) {
			obj[last] = value;
		}
		else {
			prematureEnd(path);
		}
		return value;
	}

	/**
	 * Sets a value just like the set function, except if the structure doesn't
	 * match the path, the corresponding structure is created.
	 * @param {Object|Array} obj an arbitrarily complex structure of Object
	 *   and Array types.
	 * @param {String} path is a jsonPath descriptor of a property in obj.
	 * @param {*} [value] sets the value of the property described
	 *   by path.
	 * @return {Object|Array}
	 */
	function construct (obj, path, value) {
		set(obj, path, value, true);
		return obj;
	}

	/**
	 * Splits a json-path expression into separate identifiers.
	 * Supports dot notation and quoted identifiers:
	 *   'items[1].thing'
	 *   'items.1.thing'
	 *   'items[1]["thing"]'
	 * @param expr
	 * @return {Array}
	 */
	function parse (expr) {
		var path = [];
		expr.replace(findIdentifiersRx, function (m, dot, bqq, bq, index) {
			// dot and index can't be blank, but bqq and bq can
			path.push(dot || index || bqq || bq || '');
			return '';
		});
		return path;
	}


	function propsToPath (ids) {
		return ids.reduce(function (path, id) {
			return path + safeProp(id, !path);
		}, '');
	}


	function safeProp (id, first) {
		return isIdentifierRx.test(id)
			? (!first ? '.' : '') + id
			: '["' + escapeQuotes(id) + '"]';
	}

	function escapeQuotes (str) {
		return str.replace('"', '\\"');
	}

	function getFromPath (obj, props, construct) {
		var prop;
		while (obj && props.length) {
			prop = props.shift();
			if (construct && !(prop in obj)) obj[prop] = {};
			obj = obj[prop];
		}
		return obj;
	}

	function prematureEnd (path) {
		throw new Error('json-path failed to navigate to terminus: ' + path);
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));

(function (define) {
define(function (require) {

	var jsonpath = require('../lib/jsonpath');
	var undef;

	return {
		get: get,
		set: set,
		construct: construct
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
	 *   the property or some part of the structure is missing.
	 * @return {*}
	 */
	function get (obj, path, missing) {
		if (!missing) missing = prematureEnd;
		try {
			return getFromPath(Object(obj), String(path));
		}
		catch (ex) {
			if (ex.prop) return missing(ex.prop, path);
			else throw ex;
		}
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
	 * @param {Function} [construct] is a function that is provided
	 *   the current property name as well as the full path and returns an
	 *   object. This object is used to construct the structure when it is
	 *   doesn't yet exist.  Use the included construct function to create
	 *   object literals or arrays, as necessary. If omitted, an error is
	 *   thrown if the structure doesn't already exist.
	 * @return {*}
	 */
	function set (obj, path, value, construct) {
		var popLast, end;
		// pop off last property
		popLast = jsonpath.pop(String(path));
		end = getFromPath(obj, popLast.path, construct);
		if (undef !== end) {
			end[popLast.name] = value;
		}
		else {
			prematureEnd(popLast.name, path);
		}
		return obj;
	}

	function getFromPath (obj, path, construct) {
		var popped, it, prop;

		if (path.length == 0) return obj;

		popped = jsonpath.pop(path);
		if (!popped.name) throw new Error('json-path parsing error: ' + path);

		it = getFromPath(obj, popped.path, construct);
		prop = it[popped.name];

		if (undef === prop) {
			prop = it[popped.name] = construct(popped.name, path);
		}

		return prop;
	}

	function prematureEnd (name, path) {
		var err = new Error('incomplete json-path structure. ' + name + ' not found in ' + path);
		err.prop = name;
		err.path = path;
		throw err;
	}

	function construct (name, path) {
		if (!isNaN(name)) return [];
		return {};
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

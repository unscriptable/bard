(function (define) {
define(function () {

	var splitJsonPathRx, undef;

	splitJsonPathRx = /(?:["']?\])?(?:\.|\[["']?|$)/;

	return jsonPath;

	/**
	 * Gets or sets a value within a complex Object/Array structure using
	 * jsonPath-like syntax.  A propPath in the following form:
	 *   'items[1].thing'
	 * will navigate to the 2nd "thing" property in this structure:
	 *   { items: [ { thing: 'foo' }, { thing: 'bar' } ] }
	 * The propPath could also be written in these other ways:
	 *   'items.1.thing'
	 *   'items[1]["thing"]'
	 * @param {Object|Array} obj an arbitrarily complex structure of Object
	 *   and Array types.
	 * @param {String} propPath is a jsonPath descriptor of a property in obj.
	 * @param {*} [value] if supplied, sets the value of the property described
	 *   by propPath.
	 * @return {*}
	 */
	function jsonPath (obj, propPath, value) {
		var props;
		props = propPath.split(splitJsonPathRx);
		if (null == obj || props.length == 0) return undef;
		if (arguments.length > 2) {
			return setFromPath(obj, props, value);
		}
		else {
			return getFromPath(obj, props);
		}
	}

	function getFromPath (obj, props) {
		do obj = obj[props.shift()]; while (obj && props.length);
		return obj;
	}

	function setFromPath (obj, props, value) {
		var last = props.pop();
		obj = getFromPath(obj, props);
		if (undef != obj) {
			return obj[last] = value;
		}
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));
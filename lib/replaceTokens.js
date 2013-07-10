/** @license MIT License (c) copyright B Cavalier & J Hann */
(function (define) {
define(function (require) {

	var parse, undef;

	parse = require('./simpleTemplate').parse;

	/**
	 * Replaces simple tokens in a string.  Tokens are in the format ${key}
	 * or {{key}}. Tokens are replaced by values looked up in an associated
	 * hashmap. If a token's key is not found in the hashmap, an empty string
	 * is inserted instead. You can override this behavior by supplying
	 * options.transform.
	 * @private
	 * @param {String} template
	 * @param {Object} options
	 * @param {Function} [options.transform] is a callback that stringifies
	 *   a token and also may be used to deal with missing properties,
	 *   date transforms, etc.
	 *   function transform (key, token) { return 'a string'; }
	 * @returns {String}
	 */
	function replaceTokens (template, options) {
		var transform, output;

		transform = options.transform || blankIfMissing;

		template = String(template);
		output = '';

		parse(
			template,
			function (text) { output += text; },
			function (key, token) {
				output += transform(key, token);
			}
		);

		return output;
	}

	return replaceTokens;

	function blankIfMissing (key, token) {
		return key === undef ? '' : key;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
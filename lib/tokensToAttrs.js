/** @license MIT License (c) copyright B Cavalier & J Hann */
(function (define) {
define(function (require) {

	var tokenRx, tagInRx, tagOutRx, attrInRx, attrOutRx,
		parseReactiveHtmlRx;

	tokenRx = '(\\$\\{[^}]*\\})|(\\{\\{[^}]*\\}\\})';
	tagInRx = '<([_$a-zA-Z][_$a-zA-Z0-9]*)\\s*';
	tagOutRx = '(>)';
	// attributes have some additional chars that tags don't:
	attrInRx = '([_$a-zA-Z][_$a-zA-Z0-9\\-]*)\\s*=\\s*["\']?';
	attrOutRx = '(["\'])';

	parseReactiveHtmlRx = new RegExp(
		[tagInRx, attrInRx, tokenRx, attrOutRx, tagOutRx].join('|'),
		'g'
	);

	/**
	 * Converts ${} or {{}} tokens to html tags with data-domo-reactpoint attrs.
	 * @param {String} template is an HTML template.
	 * @param {Object} options are for future use.
	 * @return {String}
	 */
	function tokensToAttrs (template, options) {
		var inTag, inAttr, end, hasReactiveAttr, reactiveAttrs;

		template = String(template);
		end = 0;

		return template.replace(parseReactiveHtmlRx, function (m, tagIn, attrIn, tokenD, tokenM, attrOut, tagOut, pos) {
			var token, out;

			if ('' === tokenD || '' === tokenM) {
				throw new Error('blank token not allowed in template.');
			}

			token = tokenD || tokenM;

			if (inAttr) {
				if (attrOut) {
					// grab any trailing attribute characters
					if (hasReactiveAttr && pos > end) {
						collect(inAttr, template.slice(end, pos));
					}
					inAttr = false;
				}
				else if (token) {
					hasReactiveAttr = true;
					// grab any leading attribute characters
					if (pos > end) {
						collect(inAttr, template.slice(end, pos));
					}
					// save attribute token
					collect(inAttr, token);
					out = '';
				}
			}
			else if (inTag) {
				if (tagOut) {
					inTag = false;
					if (hasReactiveAttr) {
						out = reactiveAttrsOutput(reactiveAttrs) + tagOut;
					}
				}
				else if (attrIn) inAttr = attrIn;
				else if (token) {
					// this is an empty attribute
					collect('', token);
					out = '';
				}
			}
			else {
				if (tagIn) {
					inTag = tagIn;
					reactiveAttrs = {};
					hasReactiveAttr = false;
				}
				else if (token) {
					// this is a text/html placeholder
					out = reactiveTextNodeOutput(token);
				}
			}

			end = pos + m.length;

			return out != null ? out : m;

			function collect (attr, snippet) {
				if (!(attr in reactiveAttrs)) reactiveAttrs[attr] = [];
				reactiveAttrs[attr].push(snippet);
			}
		});

	}

	return tokensToAttrs;

	function reactiveAttrsOutput (attrs) {
		// collect attrs into a descriptor string
		// data-domo-reactpoint="attr1:template1;attr2:template2"
		return ' data-domo-reactpoint="' + Object.keys(attrs).map(function (attr) {
			var template;
			template = attrs[attr].join('');
			// empty tokens have a special attribute
			return (attr || '(empty)') + ':' + template;
		}).join(';') + '"';
	}

	function reactiveTextNodeOutput (token) {
		var parts;
		parts = token.split(':', 2);
		if (parts.length == 1) parts.unshift('text');
		return '<span data-domo-reactpoint="' + parts.join(':') + '"></span>';
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
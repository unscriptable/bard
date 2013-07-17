/** @license MIT License (c) copyright B Cavalier & J Hann */
(function (define) {
define(function (require) {

	var simpleTemplate = require('./simpleTemplate');

	function createAccessors (bindings, options) {
		var getters, setters;

		getters = [];
		setters = [];

		bindings.forEach(function (binding) {
			binding.bind.forEach(function (mapping) {
				var accessor;
				accessor = createAccessor(binding.node, mapping[0], mapping[1]);
				if (accessor[0]) setters.push(accessor[0]);
				if (accessor[1]) getters.push(accessor[1]);
			});

		});

		return {
			push: function (provider) {
				for (var i = 0; i < setters.length; i++) setters[i](provider);
			},
			pull: function (receiver) {
				for (var i = 0; i < getters.length; i++) getters[i](receiver);
			}
		}
	}

	return createAccessors;

	function createAccessor (node, attr, template) {
		var compiled, key, setter, getter;

		compiled = simpleTemplate.compile(template);
		if (compiled.length > 1) {
			setter = createTemplateUpdater(node, attr, compiled);
		}
		else {
			// key is a literal if the {{}} wrapper was omitted
			key = compiled[0].key || compiled[0].literal;
			setter = createSetter(node, attr, key);
			getter = createGetter(node, attr, key);
		}
		return [setter, getter];
	}

	function createTemplateUpdater (node, attr, compiled) {
		var setter = createSetter(node, attr);
		return function (provider) {
			var content = simpleTemplate.exec(compiled, provider);
			setter(function () { return content; });
		};
	}

	function createSetter (node, attr, key) {
		if ('(empty)' == attr) return createEmptySetter(node, key);
		if ('text' == attr) attr = 'data';
		else if ('html' == attr) attr = 'innerHTML';
		return attr in node
			? function (provider) { node[attr] = provider(key); }
			: function (provider) { node.setAttribute(attr, provider(key)); }
	}

	function createGetter (node, attr, key) {
		if ('(empty)' == attr) return createEmptyGetter(node, key);
		if ('text' == attr) attr = 'data';
		else if ('html' == attr) attr = 'innerHTML';
		return attr in node
			? function (receiver) { receiver(key, node[attr]); }
			: function (receiver) { receiver(key, node.getAttribute(attr)); }
	}

	function createEmptySetter (node, key) {
		return function (provider) {
			if (provider(key)) {
				node.setAttribute(key, key);
			}
			else {
				node.removeAttribute(key);
			}
		};
	}

	function createEmptyGetter (node, key) {
		return function (receiver) {
			// Note: there may be IE6-8 issues lurking here:
			receiver(key, node.hasAttribute(key));
		};
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
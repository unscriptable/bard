(function (buster, define) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

define(function (require) {

	var native = require('../../proxy/native');

	var obj, array;

	obj = {
		one: {
			two: {
				three: 3
			}
		}
	};

	array = [
		{ string: 'foo' },
		{ number: 1 },
		{ date: new Date() },
		obj
	];

	obj.array = array;

	buster.testCase('proxy/native', {
//		'should fail silently when reading from primitives': function () {
//			refute.exception(function () { native.get(5, 'foo'); });
//		},
//		'should fail silently when writing to primitives': function () {
//			refute.exception(function () { native.set(5, 'foo', 3); });
//		},
		'should support dot syntax to read an object property': function () {
			assert.equals(3, native.get(obj, 'one.two.three'));
		},
		'should support dot syntax to write an object property': function () {
			native.set(obj, 'one.two.three', 'three');
			assert.equals('three', obj.one.two.three);
			native.set(obj, 'one.two.three', 3);
		},
		'should support bracket syntax to read an object property': function () {
			assert.equals(3, native.get(obj, '["one"]["two"]["three"]'));
		},
		'should support bracket syntax to write an object property': function () {
			native.set(obj, '["one"]["two"]["three"]', 'three');
			assert.equals('three', obj.one.two.three);
			native.set(obj, '["one"]["two"]["three"]', 3);
		},
		'should support bracket syntax to read an array item': function () {
			assert.equals(1, native.get(obj, 'array[1].number'));
			assert.equals(3, native.get(array, '[3].one.two.three'));
		},
		'should throw if path is too long or doesn\'t match structure': function () {
			assert.exception(function () { native.get(obj, 'array[1].foofoo.blah'); });
			assert.exception(function () { native.set(obj, 'array[1].foofoo.doh', 3); });
		},
		'should construct structure from path': function () {
			var obj = native.set({}, 'one["two"].three', 3, native.construct);
			assert.equals(obj, { one: { two: { three: 3 } } });
		}
	});

});
}(
	this.buster || require('buster'),
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

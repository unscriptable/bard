/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function () {

	return {
		binary: binarySearch,
		grope: gropeSearch
	};

	/**
	 * Searches through a list of items, looking for the correct slot
	 * position for an item.
	 * @param {Number} min points at the first possible slot
	 * @param {Number} max points at the slot after the last possible slot
	 * @param {Function} compare is a function to determine how well the
	 *   current position is correct. must return a number, but only cares if
	 *   the number is positive, negative, or zero.
	 * @returns {Number} returns the slot where the item should be placed
	 *   into the list.
	 */
	function binarySearch (min, max, compare) {
		var mid, diff;
		if (max <= min) return min;
		do {
			mid = Math.floor((min + max) / 2);
			diff = compare(mid);
			// if we've narrowed down to a choice of just two slots
			if (max - min <= 1) {
				return diff == 0 ? mid : diff > 0 ? max : min;
			}
			// don't use mid +/- 1 or we may miss in-between values
			if (diff > 0) min = mid;
			else if (diff < 0) max = mid;
			else return mid;
		}
 		while (true);
	}

	/**
	 * Gropes around a given position in a list to find an exact item.  Uses
	 * the match function to determine if it has a match.  Uses the proximal
	 * function to know if it has groped too far.
	 * @param {Number} approx
	 * @param {Number} min points at the first possible slot
	 * @param {Number} max points at the slot after the last possible slot
	 * @param {Function} match must return true if the item at given position
	 *   is an exact match.
	 * @param {Function} proximal is a function to determine how well the
	 *   current position is correct. must return a number, but only cares if
	 *   the number is positive, negative, or zero.
	 * @return {Number}
	 */
	function gropeSearch (approx, min, max, match, proximal) {
		var offset = 1, low, high, tooHigh, tooLow;

		if (match(approx)) return approx;

		do {
			high = approx + offset;
			tooHigh = tooHigh || high >= max;
			if (!tooHigh) {
				if (match(high)) return high;
				tooHigh = proximal(high) > 0;
			}
			low = approx - offset;
			tooLow = tooLow || low < min;
			if (!tooLow) {
				if (match(low)) return low;
				tooLow = proximal(low) < 0;
			}
			offset++;
		}
		while (!tooHigh || !tooLow);

		return -1;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));

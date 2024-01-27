/**
 * Find average value
 * @param {Array} items array of items
 * @param {string} field value field name
 * @returns {number} average
 */
export function findAvg(items, field) {
	if (items.length === 0) {
		throw new Error('Cannot find average from 0 items')
	}

	const total = items.reduce((prev, curr) => { return prev + curr[field] }, 0)
	return total / items.length
}


/**
 * Find median value
 * @param {Array} items array of items
 * @param {string} field value field name
 * @returns {number} median
 */
export function findMedian(items, field) {
	if (items.length === 0) {
		throw new Error('Cannot find median from 0 items')
	}

	const values = items.map((item) => item[field]).toSorted((a, b) => a - b)

	const half = Math.floor(values.length / 2)

	return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2
}


/** Find min and max values
 * @param {Array} items array of items
 * @param {string} field value field name
 * @returns {{ min: number, max: number }} min max object
 */
export function findMinMax(items, field) {
	if (items.length === 0) {
		throw new Error('Cannot find min and max values from 0 items')
	}

	let min = items[0][field]
	let max = items[0][field]

	items.forEach((item) => {
		if (min > item.value) {
			min = item.value
		}

		if (max < item.value) {
			max = item.value
		}
	})

	return { min, max }
}

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns random
 */
export function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min)
}

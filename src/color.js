/**
 * Convert HEX color to RGB-object
 * @param {string} hex Hex representation of color. eg. #FFFFFF, #00FF00, etc.
 * @returns {{ r: number, g: number, b: number }} object with rgb values of color
 */
export function hex2rgb(hex) {
	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)

	return { r, g, b }
}

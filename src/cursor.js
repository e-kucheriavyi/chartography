/**
 * Find cursor position relative to canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} x 
 * @param {number} y 
 * @returns 
 */
export function normalizeCursor(canvas, x, y) {
	return {
		x: x - canvas.offsetLeft,
		y: y - canvas.offsetTop,
	}
}

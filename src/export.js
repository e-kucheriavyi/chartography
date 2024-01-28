/**
 * Exports canvas to PNG.
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 */
export function exportChart(canvas, filename = '') {
	const image = canvas.toDataURL()

	const link = document.createElement('a')

	link.download = `${filename !== '' ? filename : new Date().toString()}.png`
	link.href = image
	link.click()
}

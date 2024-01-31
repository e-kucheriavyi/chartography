import { TextRenderer } from './text.js'


export class TooltipRenderer {
	/**
	 * 
	 * @param {HTMLCanvasElement} canvas
	 * @param {number} x 
	 * @param {number} y 
	 * @param {string} text 
	 */
	static renderTooltip(canvas, x, y, text) {
		const ctx = canvas.getContext('2d')

		ctx.fillStyle = '#FFFFFF'
		ctx.fillRect(x, y, 100, 50)

		ctx.fillStyle = '#000000'
		ctx.fillText(text, x + 5, y + 15)
	}

	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 */
	static clear(canvas) {
		const ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)
	}
}

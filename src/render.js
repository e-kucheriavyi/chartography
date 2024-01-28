export class Render {
	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 * @param {CanvasRenderingContext2D} ctx 
	 * @param {string} text 
	 */
	static noData(canvas, ctx, text = 'No data', color = '#000000') {
		const { width, height } = canvas

		const x = width / 2
		const y = height / 2

		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'

		ctx.fillStyle = color
		ctx.font = '48px Arial'
		ctx.fillText(text, x, y)
	}
}

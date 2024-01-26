import { resizer } from './resizer.js'
import { hex2rgb } from './color.js'
import { findMinMax } from './statistics.js'


export class Heatmap {
	root = null
	config = {
		rows: 7, // either cols or rows
		cols: 0, // either cols or rows
		color: '#00ff00',
		bg: '#333333',
		rgb: { r: 0, g: 255, b: 0 },
		spacing: 5,
		padding: 5,
		sumByCol: false,
		sumByRow: false,
		showScale: false,
		showMedian: false,
		showAvg: false,
		colLabelMethod: () => '',
		rowLabelMethod: () => '',
	}

	data = []
	computed = {
		width: 0,
		height: 0,
		max: 0,
		min: 0,
	}

	/**
	 * 
	 * @param {HTMLElement} root 
	 * @param {Array} data 
	 * @param {Object} config 
	 */
	constructor(root, data = [], config = {}) {
		this.root = root

		this.create()
		this.setData(data)
		this.setConfig(config)
		this.render()
	}

	create() {
		const canvas = document.createElement('canvas')

		canvas.style = 'width: 100%; height: 100%;'

		this.ctx = canvas.getContext('2d')
		this.canvas = canvas
		this.root.appendChild(canvas)

		this.resize()

		resizer.watch(this)
	}

	setData(data) {
		this.data = data

		this.computed = {
			...this.computed,
			...findMinMax(data, 'value'),
			...this.findItemsSize(data, 'value')
		}
	}

	setConfig(config) {
		if (config?.rows > 0 && config?.cols > 0) {
			throw new Error('It must be either cols or rows')
		}

		const newConfig = {
			...this.config,
			...config,
		}

		newConfig.rgb = hex2rgb(newConfig.color)

		this.config = newConfig
	}

	findItemsSize(data) {
		const { padding, spacing, rows } = this.config
		const h = this.canvas.height - (padding * 2) - (spacing * rows)
		const height = Math.round(h / rows)

		const c = Math.ceil(data.length / rows)

		const w = this.canvas.width - (padding * 2) - (spacing * c)
		const width = w / c

		return { width, height }
	}

	render() {
		this.ctx.fillStyle = this.config.bg
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		const data = [...this.data]

		if (data.length === 0) {
			return
		}

		const { padding, spacing, rgb } = this.config

		let x = padding
		let y = padding

		const { width, height, max } = this.computed

		data.forEach((item) => {
			const opacity = item.value / max
			this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
			this.ctx.fillRect(x, y, width, height)

			y += height + spacing

			if (y >= this.canvas.height - padding || y + height >= this.canvas.height - padding) {
				y = padding
				x += width + spacing
			}
		})
	}

	resize() {
		this.canvas.width = this.canvas.clientWidth
		this.canvas.height = this.canvas.clientHeight
	}

	dispose() {
		resizer.forget(this)
	}
}

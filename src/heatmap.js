import { resizer } from './resizer.js'
import { hex2rgb } from './color.js'
import { findMinMax, findAvg, findMedian } from './statistics.js'


export class Heatmap {
	root = null
	config = {
		rows: 7, // either cols or rows
		cols: 0, // either cols or rows
		fill: '#00923F',
		stroke: '#CCCCCC',
		hoverStroke: '#AAAAAA',
		bg: '#FFFFFF',
		medianColor: '#FF0000',
		avgColor: '#0000FF',
		rgb: { r: 0, g: 0, b: 0 },
		spacing: 1,
		padding: 5,
		sumByCol: false,
		sumByRow: false,
		showScale: false,
		showMedian: false,
		showAvg: false,
		colLabelMethod: () => '',
		rowLabelMethod: () => '',
		onClick: () => null,
		tooltipLabelMethod: () => '',
	}

	data = []
	rendered = []

	computed = {
		width: 0,
		height: 0,
		max: 0,
		min: 0,
		rows: [],
	}

	scaleHeight = 30

	hoveredIndex = -1

	/**
	 * 
	 * @param {HTMLElement} root 
	 * @param {Array} data 
	 * @param {Object} config 
	 */
	constructor(root, data = [], config = {}) {
		this.root = root

		this.create()
		this.setConfig(config)
		this.setData(data)
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

		this.canvas.addEventListener('mousemove', (e) => {
			this.handleMouseMove(e.clientX, e.clientY)
		})
	}

	setData(data) {
		this.data = [...data]

		const rows = []

		let row = []

		this.data.forEach((item) => {
			row.push(item)

			if (row.length === this.config.rows) {
				rows.push([...row])
				row = []
			}
		})

		this.computed = {
			...this.computed,
			...findMinMax(data, 'value'),
			...this.findItemsSize(data, 'value'),
			median: findMedian(data, 'value'),
			avg: findAvg(data, 'value'),
			rows,
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

		newConfig.rgb = hex2rgb(newConfig.fill)

		this.config = newConfig
	}

	findWorkArea(config) {
		const { rows, padding, sumByCol, sumByRow, showScale } = config
		const { width, height } = this.canvas

		let w = width - padding * 2
		let h = height - padding * 2

		let x = padding
		let y = padding

		if (showScale) {
			h -= this.scaleHeight
		}

		return { x, y, w, h }
	}

	findItemsSize(data) {
		const { spacing, rows } = this.config
		const area = this.findWorkArea(this.config)

		const h = area.h - (spacing * rows)
		const height = Math.round(h / rows)

		const c = Math.ceil(data.length / rows)

		const w = area.w - (spacing * c)
		const width = w / c

		return { width, height }
	}

	renderScale() {
		const ctx = this.ctx
		const { padding, bg, fill, stroke, strokeHover, showMedian, showAvg } = this.config
		const { width, height } = this.canvas

		const gradient = ctx.createLinearGradient(0, 0, width, 0)

		gradient.addColorStop(0, bg)
		gradient.addColorStop(1, fill)

		ctx.lineWidth = 1
		ctx.fillStyle = gradient
		ctx.strokeStyle = stroke

		const x = padding
		const y = height - this.scaleHeight
		const w = width - padding * 2
		const h = this.scaleHeight - padding

		ctx.fillRect(x, y, w, h)
		ctx.strokeRect(x, y, w, h)

		if (this.hoveredIndex !== -1) {
			const item = this.data[this.hoveredIndex]

			const pos = item.value / this.computed.max

			ctx.lineWidth = 1
			ctx.strokeStyle = strokeHover

			ctx.beginPath()
			ctx.moveTo((w - x) * pos, y)
			ctx.lineTo((w - x) * pos, y + this.scaleHeight - padding)
			ctx.stroke()
		}

		if (showMedian) {
			const pos = this.computed.median / this.computed.max

			console.log(this.computed.median, this.computed.max, pos)

			ctx.lineWidth = 1
			ctx.strokeStyle = this.config.medianColor

			ctx.beginPath()
			ctx.moveTo((w - x) * pos, y)
			ctx.lineTo((w - x) * pos, y + this.scaleHeight - padding)
			ctx.stroke()
		}

		if (showAvg) {
			const pos = this.computed.avg / this.computed.max

			ctx.lineWidth = 1
			ctx.strokeStyle = this.config.avgColor

			ctx.beginPath()
			ctx.moveTo((w - x) * pos, y)
			ctx.lineTo((w - x) * pos, y + this.scaleHeight - padding)
			ctx.stroke()
		}
	}

	renderItem(item) {

	}

	findHovered(x, y) {
		const area = this.findWorkArea(this.config)

		if (x < area.x || y < area.y || x > area.w || y > area.h) {
			if (this.hoveredIndex !== -1) {
				this.hoveredIndex = -1
				this.render()
			}
			return
		}

		const newIndex = this.rendered.findIndex((item) => {
			if (item.x > x || item.y > y) {
				return false
			}

			if (x > item.x + item.width || y > item.y + item.height) {
				return false
			}

			return true
		})

		if (newIndex === this.hoveredIndex) {
			return
		}

		this.hoveredIndex = newIndex
		this.render()
	}

	render() {
		const ctx = this.ctx
		ctx.fillStyle = this.config.bg
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		const area = this.findWorkArea(this.config)

		const data = [...this.data]

		if (data.length === 0) {
			return
		}

		const { padding, spacing, rgb, rows, stroke, strokeHover } = this.config

		let x = area.x
		let y = area.y

		const maxHeight = area.h
		const maxWidth = area.w

		if (this.config.showScale) {
			this.renderScale()
		}

		const { width, height, max } = this.computed

		let currentRow = 0
		let currentCol = 0

		this.rendered = []

		data.forEach((item, index) => {
			const opacity = item.value / max

			ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
			ctx.strokeStyle = index === this.hoveredIndex ? strokeHover : stroke
			ctx.lineWidth = index === this.hoveredIndex ? 2 : 1
			ctx.fillRect(x, y, width, height)
			ctx.strokeRect(x, y, width, height)

			this.rendered.push({
				x, y, width, height, item, row: currentRow, col: currentCol,
			})

			y += height + spacing
			currentRow += 1

			if (currentRow >= rows) {
				y = area.y
				x += width + spacing
				currentRow = 0
				currentCol += 1
			}
		})
	}

	resize() {
		this.canvas.width = this.canvas.clientWidth
		this.canvas.height = this.canvas.clientHeight
	}

	handleMouseMove(x, y) {
		this.findHovered(x - this.canvas.offsetLeft, y - this.canvas.offsetTop)
	}

	dispose() {
		resizer.forget(this)
	}
}

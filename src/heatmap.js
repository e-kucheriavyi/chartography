import { resizer } from './resizer.js'
import { TextRenderer } from './renderers/text.js'
import { hex2rgb } from './color.js'
import { findMinMax, findAvg, findMedian } from './statistics.js'
import { TooltipRenderer } from './renderers/tooltip.js'
import { collideRect } from './collider.js'
import { normalizeCursor } from './cursor.js'

/**
 * @typedef {{
 * rows?: number
 * cols?: number
 * fill?: string
 * stroke?: string
 * hoverStroke?: string
 * bg?: string
 * medianColor?: string
 * avgColor?: string
 * noDataText?: string
 * rgb?: {
 *  r: number
 *  g: number
 *  b: number
 * }
 * spacing?: number
 * padding?: number
 * scaleHeight?: number
 * labelSize?: number
 * colLabelSkip?: number
 * colLabelPosition?: 'top'|'bottom'|'both'|'none'
 * rowLabelSkip?: number
 * rowLabelPosition?: 'left'|'right'|'both'|'none'
 * sumByCol?: boolean
 * sumByRow?: boolean
 * showScale?: boolean
 * showMedian?: boolean
 * showAvg?: boolean
 * animationDuration?: number
 * colLabelMethod?: Function
 * rowLabelMethod?: Function
 * onClick?: Function
 * showTooltip? boolean
 * tooltipLabelMethod?: Function
 * }} HeatmapConfigParams
 */


export class Heatmap {
	root = null
	canvas = null
	controlCanvas = null
	controlCtx = null
	ctx = null

	config = {
		rows: 7, // either cols or rows
		cols: 0, // either cols or rows
		fill: '#00923F',
		stroke: '#CCCCCC',
		hoverStroke: '#AAAAAA',
		bg: '#FFFFFF',
		medianColor: '#FF0000',
		avgColor: '#0000FF',
		noDataText: 'No data',
		rgb: { r: 0, g: 0, b: 0 },
		spacing: 1,
		padding: 5,
		scaleHeight: 30,
		labelSize: 15,
		colLabelSkip: 0,
		colLabelPosition: 'both', // top, bottom, both, none
		rowLabelSkip: 0,
		rowLabelPosition: 'left', // left, right, both, none
		sumByCol: false,
		sumByRow: false,
		showScale: false,
		showMedian: false,
		showAvg: false,
		showTooltip: true,
		colLabelMethod: () => '',
		rowLabelMethod: () => '',
		onClick: () => null,
		tooltipLabelMethod: (item) => item.value,
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

	hoveredIndex = -1

	/**
	 * 
	 * @param {HTMLElement} root 
	 * @param {Array} data 
	 * @param {HeatmapConfigParams} config 
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
		const controlCanvas = document.createElement('canvas')

		const style = 'position: absolute; width: 100%; height: 100%;'
		canvas.style = style
		controlCanvas.style = style

		this.ctx = canvas.getContext('2d')
		this.canvas = canvas
		this.controlCanvas = controlCanvas

		this.root.appendChild(canvas)
		this.root.appendChild(controlCanvas)

		this.resize()

		resizer.watch(this)

		this.controlCanvas.addEventListener('mousemove', (e) => {
			this.handleMouseMove(e.clientX, e.clientY)
		})

		this.controlCanvas.addEventListener('click', (e) => {
			this.handleClick(e.clientX, e.clientY)
		})
	}

	setData(data) {
		this.data = [...data]

		if (data.length === 0) {
			return
		}

		const rows = []
		let row = []

		this.data.forEach((item, index) => {
			row.push(item)

			if (row.length >= this.config.rows) {
				rows.push(row)
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

	/**
	 * 
	 * @param {HeatmapConfigParams} config 
	 */
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

	/**
	 * 
	 * @param {HeatmapConfigParams} config 
	 */
	findWorkArea(config) {
		const { rows, padding, sumByCol, sumByRow, showScale, scaleHeight } = config
		const { width, height } = this.canvas

		let w = width - padding * 2
		let h = height - padding * 2

		let x = padding
		let y = padding

		if (showScale) {
			h -= scaleHeight
		}

		return { x, y, width: w, height: h }
	}

	findItemsSize(data) {
		const { spacing, rows } = this.config
		const area = this.findWorkArea(this.config)

		const h = area.height - (spacing * rows)
		const height = Math.round(h / rows)

		const c = Math.ceil(data.length / rows)

		const w = area.width - (spacing * c)
		const width = w / c

		return { width, height }
	}

	findScaleSize() {
		const { padding, scaleHeight } = this.config
		const { width, height } = this.canvas

		return {
			x: padding,
			y: height - scaleHeight,
			w: width - padding * 2,
			h: scaleHeight - padding,
		}
	}

	renderScaleCursor(value, color) {
		const ctx = this.ctx
		const { padding, scaleHeight } = this.config
		let pos = value / this.computed.max

		if (pos <= 0.005) {
			pos = 0.005
		}

		ctx.lineWidth = 1
		ctx.strokeStyle = color

		const { x, y, w } = this.findScaleSize()

		ctx.beginPath()
		ctx.moveTo((w - x) * pos, y)
		ctx.lineTo((w - x) * pos, y + scaleHeight - padding)
		ctx.stroke()
	}

	renderScale() {
		const ctx = this.ctx
		const { bg, fill, stroke, strokeHover, showMedian, showAvg } = this.config
		const { width } = this.canvas

		const gradient = ctx.createLinearGradient(0, 0, width, 0)

		gradient.addColorStop(0, bg)
		gradient.addColorStop(1, fill)

		ctx.lineWidth = 1
		ctx.fillStyle = gradient
		ctx.strokeStyle = stroke

		const { x, y, w, h } = this.findScaleSize()

		ctx.fillRect(x, y, w, h)
		ctx.strokeRect(x, y, w, h)

		if (this.hoveredIndex !== -1) {
			this.renderScaleCursor(this.data[this.hoveredIndex].value, strokeHover)
		}

		if (showMedian) {
			this.renderScaleCursor(this.computed.median, this.config.medianColor)
		}

		if (showAvg) {
			this.renderScaleCursor(this.computed.avg, this.config.avgColor)
		}
	}

	renderItem(item) {

	}

	findHovered(x, y) {
		const area = this.findWorkArea(this.config)

		if (!collideRect(area, x, y)) {
			TooltipRenderer.clear(this.controlCanvas)
			if (this.hoveredIndex !== -1) {
				this.hoveredIndex = -1
				this.render()
			}
			return
		}

		const newIndex = this.rendered.findIndex((item) => collideRect(item, x, y))

		if (newIndex === this.hoveredIndex) {
			return
		}

		TooltipRenderer.clear(this.controlCanvas)

		this.hoveredIndex = newIndex
		this.render()

		if (this.config.showTooltip && newIndex !== -1) {
			TooltipRenderer.renderTooltip(
				this.controlCanvas,
				this.rendered[newIndex].x,
				this.rendered[newIndex].y,
				this.config.tooltipLabelMethod(this.data[newIndex]),
			)
			return
		}
	}

	render() {
		const ctx = this.ctx
		ctx.fillStyle = this.config.bg
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		if (this.data.length === 0) {
			TextRenderer.noData(this.canvas, ctx, this.config.noDataText)
			return
		}

		const area = this.findWorkArea(this.config)

		const data = [...this.data]

		if (data.length === 0) {
			return
		}

		const { spacing, rgb, rows, stroke, strokeHover } = this.config

		let x = area.x
		let y = area.y

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
		this.controlCanvas.width = this.canvas.clientWidth
		this.controlCanvas.height = this.canvas.clientHeight
		this.setData(this.data)
		this.setConfig(this.config)
	}

	handleMouseMove(cursorX, cursorY) {
		const { x, y } = normalizeCursor(this.controlCanvas, cursorX, cursorY)
		this.findHovered(x, y)
	}

	handleClick(cursorX, cursorY) {
		const { x, y } = normalizeCursor(this.controlCanvas, cursorX, cursorY)
		console.log(x, y)
	}

	dispose() {
		resizer.forget(this)
	}
}

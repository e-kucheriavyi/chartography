export class Resizer {
	timer = null
	observer = null
	delay = 300

	constructor(delay = 300) {
		this.delay = delay
		this.observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				this.queueResize(entry.target)
			}
		})
	}

	charts = []

	queue = []

	queueResize(entry) {
		if (this.queue.includes(entry)) {
			return
		}

		this.queue.push(entry)

		clearTimeout(this.timer)

		this.timer = setTimeout(() => {
			this.resize(this.queue[0])
		}, this.delay)
	}

	resize(entry) {
		this.queue = this.queue.filter((q) => q !== entry)

		const chart = this.charts.find((c) => c.root === entry)

		if (!chart) {
			throw new Error('chart not found')
		}

		chart.resize()
		chart.render()
	}

	watch(chart) {
		if (this.charts.includes(chart)) {
			throw new Error('Allready watching')
		}

		this.charts.push(chart)

		this.observer.observe(chart.root)
	}

	forget(chart) {
		if (!this.charts.includes(chart)) {
			throw new Error('Was not watching')
		}

		this.charts = this.charts.filter((c) => c !== chart)

		this.observer.unobserve(chart.root)
	}
}

export const resizer = new Resizer()

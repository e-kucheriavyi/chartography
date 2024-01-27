import { Heatmap } from '../src/heatmap.js'
import { randomInt } from '../src/statistics.js'


export default {
	title: 'Chartography/Heatmap',
	tags: ['autodocs'],
	render: ({ label, ...args }) => {
		const container = document.createElement('div')
		container.style = `width: ${args.width}; height: ${args.height};`

		const config = {
			rows: args.rows,
			fill: args.fill,
			stroke: args.stroke,
			strokeHover: args.strokeHover,
			medianColor: args.medianColor,
			avgColor: args.avgColor,
			sumByRow: args.sumByRow,
			sumByCol: args.sumByCol,
			showScale: args.showScale,
			showMedian: args.showMedian,
			showAvg: args.showAvg,
			spacing: args.spacing,
			padding: args.padding,
			bg: args.bg,
		}

		setTimeout(() => {
			const heatmap = new Heatmap(container, args.data, config)
			heatmap.render()
		}, 1000)
		return container
	},
	argTypes: {
		fill: { control: 'color' },
		stroke: { control: 'color' },
		strokeHover: { control: 'color' },
		bg: { control: 'color' },
		medianColor: { control: 'color' },
		avgColor: { control: 'color' },
		width: { control: 'text' },
		height: { control: 'text' },
		spacing: { control: 'number' },
		padding: { control: 'number' },
		rows: { control: 'number' },
		sumByCol: { control: 'boolean' },
		sumByRow: { control: 'boolean' },
		showScale: { control: 'boolean' },
		showMedian: { control: 'boolean' },
		showAvg: { control: 'boolean' },
	},
}

const data = []

let curr = new Date(2023, 0, 1)
const year = curr.getFullYear()

let i = 0

while (curr.getFullYear() === year) {
	data.push({
		label: new Date(curr),
		value: randomInt(0, 10000),
	})

	curr.setDate(curr.getDate() + 1)
	i += 1
}

export const Year = {
	args: {
		fill: '#00923F',
		stroke: '#CCCCCC',
		strokeHover: '#000000',
		bg: '#FFFFFF',
		medianColor: '#FF0000',
		avgColor: '#0000FF',
		width: '100%',
		height: '360px',
		rows: 7,
		spacing: 1,
		padding: 5,
		sumByCol: true,
		sumByRow: true,
		showScale: true,
		showMedian: true,
		showAvg: true,
		data,
	},
}

export const YearEmpty = {
	args: {
		fill: '#00923F',
		stroke: '#EEEEEE',
		strokeHover: '#DDDDDD',
		bg: '#FFFFFF',
		width: '100%',
		height: '360px',
		rows: 7,
		spacing: 1,
		padding: 5,
		sumByCol: false,
		sumByRow: false,
		data: [],
	},
}

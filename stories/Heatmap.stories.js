import { Heatmap } from '../src/heatmap.js'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
	title: 'Example/Heatmap',
	tags: ['autodocs'],
	render: ({ label, ...args }) => {
		const container = document.createElement('div')
		container.style = `width: ${args.width}; height: ${args.height};`

		const config = {
			rows: args.rows,
			color: args.color,
			sumByRow: args.sumByRow,
			sumByCol: args.sumByCol,
			spacing: args.spacing,
			padding: args.padding,
			bg: args.bg,
			cellBg: args.cellBg,
		}

		setTimeout(() => {
			const heatmap = new Heatmap(container, args.data, config)
			heatmap.render()
		}, 1000)
		return container
	},
	argTypes: {
		color: { control: 'color' },
		bg: { control: 'color' },
		cellBg: { control: 'color' },
		width: { control: 'text' },
		height: { control: 'text' },
		spacing: { control: 'number' },
		padding: { control: 'number' },
		rows: { control: 'number' },
		sumByCol: { control: 'boolean' },
		sumByRow: { control: 'boolean' },
	},
}

const data = []

const year = new Date().getFullYear()
let curr = new Date(2024, 0, 1)

let i = 0

while (curr.getFullYear() === year) {
	data.push({
		label: new Date(curr),
		value: i,
	})

	curr.setDate(curr.getDate() + 1)
	i += 1
}

export const Year = {
	args: {
		color: '#00ff00',
		bg: '#FFFFFF',
		width: '100%',
		height: '360px',
		rows: 7,
		spacing: 5,
		padding: 5,
		sumByCol: false,
		sumByRow: false,
		data,
	},
}

export const YearEmpty = {
	args: {
		color: '#00FF00',
		bg: '#FFFFFF',
		cellBg: '#333333',
		width: '100%',
		height: '360px',
		rows: 7,
		spacing: 5,
		padding: 5,
		sumByCol: false,
		sumByRow: false,
		data: [],
	},
}

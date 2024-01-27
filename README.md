# Chartography

__Chartography__ is a charts drawing library.

## Installation

```
npm install chartography
```

## Usage

### Create chart

```
import { Heatmap } from 'chartogprahpy'

const root = document.getElementById('container')

const data = [
	{ label: 'One', value: 100 },
	{ label: 'Two', value: 200 },
	{ label: 'Three', value: 300 },
	// ...
]

const config = {
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
}

const heatmap = new Heatmap(root, data, config)
heatmap.render()
```

### Update data

```
heatmap.setData([])
heatmap.render()
```

## Examples

__Chartography__ has Storybook powered documentation: https://chartography.kucheriavyi.ru/



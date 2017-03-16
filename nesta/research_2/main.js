var width = 1020,
	height = 750;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var yValues = [],
	xValues = [],
	maxValue = 0;

d3.csv(
	'engineering_tech_lad.csv',
	function(line, i) {
		var propsToIgnore = ['lad_name'];

		if (i == 0) {
			Object.keys(line).forEach(function(prop, j) {
				if (propsToIgnore.indexOf(prop) == -1) {
					yValues.push(prop);
				}
			});
		}
		else {
			xValues.push(line['lad_name']);
		}

		var res = []
		yValues.forEach(function(y, j) {
			if (line[y] !== undefined && line[y] != '') {
				var v = {
					x: line['lad_name'],
					y: y,
					value: parseFloat(line[y])
				}
				res.push(v);
				maxValue = Math.max(maxValue, v.value);
			}
		});
		return res;
	},
	function(rawData) {
		var data = rawData.reduce(function(a, b) { return a.concat(b); }, []);

		var heatmap = new Heatmap(svg, xValues, yValues, data, {
			maxValue: maxValue,
			leftMargin: 200,
			rotateYAxisTips: false,
			cellWidth: 90,
			legendSteps: 10,
			showTopAxis: true,
			showBottomAxis: false,
			topMargin: 40,
			sorting: true,
			legendText: 'engineering_tech_lad'
		});
		heatmap.draw();
});
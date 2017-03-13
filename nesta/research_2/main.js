var width = 1020,
	height = 750;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


d3.csv('engineering_tech_lad.csv', function(rawData) {
	var xValues,
		yValues,
		data,
		maxValue = 0;

	function prepareData() {
		xValues = [];
		yValues = [];
		data = [];

		var xValuesName = Object.keys(rawData[0])[0];

		for (var prop in rawData[0])
			if (prop != xValuesName && rawData[0].hasOwnProperty(prop))
				yValues.push(prop);

		rawData.forEach(function(d, i) {
			xValues.push(d[xValuesName]);
			yValues.forEach(function(y, j) {
				data.push({
					value: d[y],
					x: i,
					y: j
				});
				maxValue = Math.max(maxValue, d[y]);
			});
		});

		for (var i = 0; i < yValues.length; i++)
			yValues[i] = yValues[i].split('_').join(' ');
	}
	prepareData();

	var heatmap = new Heatmap(svg, xValues, yValues, data, {
		maxValue: maxValue,
		leftMargin: 200,
		rotateYAxisTips: false,
		cellWidth: 90,
		legendSteps: 10
	});
	heatmap.draw();
});
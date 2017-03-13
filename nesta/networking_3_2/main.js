var width = 4300,
	height = 1700;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


d3.csv('normalised_attendants_in_other_cities.csv', function(rawData) {
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
	}
	prepareData();

	var heatmap = new Heatmap(svg, xValues, yValues, data, { maxValue: maxValue });
	heatmap.draw();
});
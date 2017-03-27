var width = 1020,
	height = 750;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);



var datareader = new Datareader();
datareader.readData(Datareader.DATASETS.EngineeringTechLad, function(lads, topics, data) {
		var maxValue = 0;
		data.forEach(function(d) {
			d.x = d.lad;
			d.y = d.topic;
			maxValue = Math.max(maxValue, d.value);
		})

		var heatmap = new Heatmap(svg, lads, topics, data, {
			minValue: 1,
			maxValue: maxValue,
			leftMargin: 250,
			rotateYAxisTips: false,
			cellWidth: 90,
			legendSteps: 5,
			showTopAxis: true,
			showBottomAxis: false,
			topMargin: 40,
			sorting: true,
			legendText: '[UNITS?]'
		});
		heatmap.draw();
});
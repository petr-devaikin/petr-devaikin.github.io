var width = 1520,
	height = 1200;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.Opportunities, function(organisations, data) {
	var maxValue = d3.max(data, function(d) { return d.value; });
	console.log(maxValue);

	var heatmap = new Heatmap(svg, organisations, organisations, data, {
		maxValue: maxValue,
		leftMargin: 200,
		rotateYAxisTips: true,
		legendSteps: 4,
		showTopAxis: true,
		showBottomAxis: false,
		topMargin: 200,
		sorting: true,
		minColor: '#eff3ff',
		maxColor: '#08519c',
		showLegend: false,
	});
	heatmap.draw();

	var filter = new Filter(d3.select('.filter'));
	filter.addColorScale('Collaboration number', maxValue, '#eff3ff', '#08519c', 5, 'discrete');
});
var width = 1000,
	height = 500;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();
datareader.readData(Datareader.DATASETS.Bubblechart, function(disciplines, topics) {
	var xValues = [1, 0];
	var yValues = [1, 0];
	var rValues = [undefined, 0];

	topics.forEach(function(topic) {
		topic.x = topic.projects.welsh;
		topic.y = topic.value.welsh;
		xValues[1] = Math.max(xValues[1], topic.x);
		yValues[1] = Math.max(yValues[1], topic.y);
		if (rValues[0] === undefined) rValues[0] = topic.projects.welshProportion;
		rValues[0] = Math.min(rValues[0], topic.projects.welshProportion);
		rValues[1] = Math.max(rValues[1], topic.projects.welshProportion);
	});

	var bubblechart = new Bubblechart(svg, xValues, yValues, rValues, topics, {
		graphWidth: 800,
		graphHeight: 400,
		useLogXScale: true,
		useLogYScale: true,
		leftLabel: 'Value',
		bottomLabel: 'Number of projects',
		categories: disciplines,
	});
	bubblechart.draw();
});
var width = 1100,
	height = 700;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();
datareader.readData(Datareader.DATASETS.Bubblechart, function(disciplines, topics) {
	var xValues = [1, 0];
	var yValues = [0, 1];
	var rValues = [0, 1];

	topics.forEach(function(topic) {
		topic.x = topic.projects.welsh;
		topic.y = topic.projects.welshProportion;
		topic.r = topic.value.welsh / topic.projects.welsh;
		xValues[1] = Math.max(xValues[1], topic.x);
		rValues[1] = Math.max(rValues[1], topic.r);
	});

	var bubblechart = new Bubblechart(svg, xValues, yValues, rValues, topics, {
		graphWidth: 800,
		graphHeight: 400,
		leftMargin: 120,
		useLogXScale: true,
		useLogYScale: false,
		leftLabel: 'Number of projects, Welsh proportion (?)',
		bottomLabel: 'Number of projects',
		categories: disciplines,
	});
	bubblechart.draw();
});
var width = 1000,
	height = 750;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();
datareader.read('bubble_chart_source_data.csv', function(disciplines, topics) {
	var xValues = [0, 0];
	var yValues = [0, 0];

	topics.forEach(function(topic) {
		topic.x = topic.number.welsh;
		topic.y = topic.value.welsh;
		xValues[1] = Math.max(xValues[1], topic.x);
		yValues[1] = Math.max(yValues[1], topic.y);
	});

	var bubblechart = new Bubblechart(svg, xValues, yValues, topics, {});
	bubblechart.draw();
});
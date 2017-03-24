var width = window.innerWidth,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.classed('vis--forcegraph', true)
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.GroupsTopic, function(nodes, links) {
	var graph = new Forcegraph(svg, nodes, links, {
		animated: false
	});
	graph.draw();
});
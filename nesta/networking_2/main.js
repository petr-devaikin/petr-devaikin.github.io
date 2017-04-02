var width = 1500,
	height = 700;

var svg = d3.select("body").append("svg")
	.classed('vis--chord', true)
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.GroupsTopic, function(nodes, links) {
	datareader.readData(Datareader.DATASETS.GroupsTopic, function(oldNodes, oldLinks) {
		oldNodes.forEach(function(n) {
			if (nodes.find(function(d) { return d.id == n.id; }) === undefined)
				nodes.push(n);
		});
		var graph = new Chord(svg, nodes, oldLinks, links, {
			margin: 150
		});
		graph.draw();
	}, true);
});
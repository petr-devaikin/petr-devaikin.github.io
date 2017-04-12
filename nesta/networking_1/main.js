var width = window.innerWidth - 200,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

console.log('Data loading');

datareader.readData(Datareader.DATASETS.MeetupAttendance, function(years, lads, topics, tags, network) {
	console.log('Data loaded');
	var selectedYear = years[years.length - 1];

	console.log(years, lads, topics, tags, network);

	// prepare network
	var filteredNetwork = network[selectedYear];
	var nodes = {};
	var links = [];
	filteredNetwork.forEach(function(d) {
		if (nodes[d.source] === undefined) {
			nodes[d.source] = {
				id: d.source,
				name: d.source,
				value: 0,
				category: tags[d.source] !== undefined ? tags[d.source].topic : undefined,
			};
		}
		if (nodes[d.target] === undefined) {
			nodes[d.target] = {
				id: d.target,
				name: d.target,
				value: 0,
				category: tags[d.target] !== undefined ? tags[d.target].topic : undefined,
			};
		}
		links.push({
			source: nodes[d.source],
			target: nodes[d.target],
			value: 1
		});
	});
	nodes = Object.keys(nodes).map(function(d) { return nodes[d]; });
	console.log(nodes.length);
	console.log(links.length);


	var graph = new Forcegraph(svg, nodes, links, topics, {
	});
	graph.draw();
});
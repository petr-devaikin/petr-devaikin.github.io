var width = window.innerWidth - 200,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

console.log('Data loading');

datareader.readData(Datareader.DATASETS.MeetupAttendance, function(years, lads, tags, topics, broadTopics, network, dataWelshRCA) {
	console.log('Data loaded');
	d3.select('.loading').remove();

	var selectedYear = years[years.length - 1];
	var selectedLad = '';

	//console.log(years, lads, topics, tags, network);

	// prepare network
	var filteredNetwork = network;//[selectedYear];
	var nodes = {};
	var links = [];
	filteredNetwork.forEach(function(d) {
		if (nodes[d.source] === undefined) {
			nodes[d.source] = {
				id: d.source,
				name: d.source,
				value: tags[d.source] !== undefined ? tags[d.source].count : 0,
				category: tags[d.source] !== undefined ? tags[d.source].topic.broad : undefined,
			};
		}
		if (nodes[d.target] === undefined) {
			nodes[d.target] = {
				id: d.target,
				name: d.target,
				value: tags[d.target] !== undefined ? tags[d.target].count : 0,
				category: tags[d.target] !== undefined ? tags[d.target].topic.broad : undefined,
			};
		}
		links.push({
			source: nodes[d.source],
			target: nodes[d.target],
			value: 1
		});
	});
	nodes = Object.keys(nodes).map(function(d) { return nodes[d]; });


	var graph = new Forcegraph(svg, nodes, links, broadTopics, {
	});
	graph.draw();

	// Filter
	var filter = new Filter(d3.select('.filter'));

	filter.addSelectSearchSection(
		'Local Authority District',
		[{ id: '', text: '' }].concat(lads.map(function(l) { return { id: l, text: l }; })),
		'',
		function(v) {
			selectedLad = v;

			var values = {};
			dataWelshRCA.forEach(function(d) {
				if (d.year == selectedYear && d.lad == selectedLad)
					values[d.topic] = d.comparative_adv;
			});

			graph.repaint(values);
		}
	);

	// filter by topics
});
var width = window.innerWidth - 200,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

console.log('Data loading');

datareader.readData(Datareader.DATASETS.MeetupNetwork, function(years, lads, tags, topics, broadTopics, network, dataWelshRCA) {
	console.log('Data loaded');
	d3.select('.loading').remove();

	var selectedYear = years[years.length - 1];
	var selectedLad = '';

	//console.log(years, lads, topics, tags, network);

	// prepare network
	var filteredNetwork = network;//[selectedYear];
	var nodes = {};
	var links = [];

	function addNode(nodeId) {
		if (nodes[nodeId] === undefined) {
			nodes[nodeId] = {
				id: nodeId,
				name: '{0}, {1}. #{2}'.format(tags[nodeId].topic.broad, tags[nodeId].topic.name, tags[nodeId].name),
				value: tags[nodeId] !== undefined ? tags[nodeId].count : 0,
				category: tags[nodeId] !== undefined ? tags[nodeId].topic.broad : undefined,
			};
		}
	}

	filteredNetwork.forEach(function(d) {
		addNode(d.source);
		addNode(d.target);
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

	function repaint() {
		if (selectedLad !== '') {
			var topicValues = {};

			dataWelshRCA.forEach(function(d) {
				if (d.year == selectedYear && d.lad == selectedLad) {
					topicValues[d.topic] = d.comparative_adv;
				}
			});

			var tagValues = {};
			Object.keys(tags).forEach(function(tagId) {
				if (topicValues[tags[tagId].topic.name] !== undefined)
					tagValues[tagId] = topicValues[tags[tagId].topic.name];
			});

			console.log(tagValues);

			graph.repaint(tagValues);
		}
		else
			graph.repaint();
	}

	// Filter
	var filter = new Filter(d3.select('.filter'));

	filter.addSelectSearchSection(
		'Local Authority District',
		[{ id: '', text: '' }].concat(lads.map(function(l) { return { id: l, text: l }; })),
		'',
		function(v) {
			selectedLad = v;
			repaint();
		}
	);

	// filter by topics
});
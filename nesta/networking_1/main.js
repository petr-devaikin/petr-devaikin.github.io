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
	var selectedLad = 'all',
		selectedBroadTopic = 'all';

	//console.log(years, lads, topics, tags, network);

	// prepare network
	var filteredNetwork = network;//[selectedYear];
	var nodes = {};
	var links = [];

	function addNode(nodeId) {
		if (nodes[nodeId] === undefined) {
			nodes[nodeId] = {
				id: nodeId,
				name: tags[nodeId].name,
				fullCategory: '{0}, {1}'.format(tags[nodeId].topic.broad, tags[nodeId].topic.name),
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
	nodes.sort(function(a, b) {
		return b.value - a.value;
	})


	var graph = new Forcegraph(svg, nodes, links, broadTopics, {
		addHint: function(hint) {
			hint.append('rect').classed('vis__hint__bg', true);
			hint.append('text').classed('vis__hint__tag', true);
			hint.append('text').classed('vis__hint__group', true).attr('dy', 15);
			hint.append('text').classed('vis__hint__count', true).attr('dy', 30);
			hint.append('text').classed('vis__hint__lq', true).attr('dy', 45);
		},
		showHint: function(hint, d) {
			hint.select('.vis__hint__tag').text('#' + d.name);
			hint.select('.vis__hint__group').text('Topic: ' + d.fullCategory);
			hint.select('.vis__hint__count').text('Count [?]: ' + d.value);
			hint.select('.vis__hint__lq').text(selectedLad != 'all' ? 'LQ [?] in ' + selectedLad + ': ' + d.opacity.abbrNum(2) : '');
		},
		selectNodeCallback: function(nodeId) {
			tagFieldCallbacks.setValue(nodeId);
		}
	});
	graph.draw();

	function repaint() {
		if (selectedLad == 'all' && selectedBroadTopic != 'all') {
			var tagValues = {};
			Object.keys(tags).forEach(function(tagId) {
				if (tags[tagId].topic.broad == selectedBroadTopic)
					tagValues[tagId] = 1;
			});
			graph.repaint(tagValues);
		}
		else if (selectedLad != 'all' || selectedBroadTopic != 'all') {
			var topicValues = {};

			dataWelshRCA.forEach(function(d) {
				if (d.year == selectedYear && (d.lad == selectedLad || selectedLad == 'all')) {
					topicValues[d.topic] = d.comparative_adv;
				}
			});

			var tagValues = {};
			Object.keys(tags).forEach(function(tagId) {
				if ((tags[tagId].topic.broad == selectedBroadTopic || selectedBroadTopic == 'all') && topicValues[tags[tagId].topic.name] !== undefined)
					tagValues[tagId] = topicValues[tags[tagId].topic.name];
			});

			graph.repaint(tagValues);
		}
		else
			graph.repaint();
	}

	// Filter
	var filter = new Filter(d3.select('.filter'));
	
	filter.addRadioSection(
		'Year',
		years.map(function(d, i) { return { label: d, value: d, checked: d == selectedYear }; }),
		function(v) {
			selectedYear = v;
			if (selectedLad != 'all')
				repaint();
		}
	);

	filter.addSelectSearchSection(
		'Local Authority District',
		[{ id: 'all', text: 'All' }].concat(lads.map(function(l) { return { id: l, text: l }; })),
		'',
		function(v) {
			selectedLad = v;
			graph.select();
			tagFieldCallbacks.update(getTagList());
			repaint();
		}
	);

	var colorScale = d3.scaleOrdinal()
			.domain(broadTopics)
			.range(broadTopics.map(function(d, i) { return d3.interpolateRainbow(i / broadTopics.length); }));

	filter.addSelectSearchSampleSection(
		'Topic',
		[{ id: 'all', text: 'All' }].concat(broadTopics.map(function(l) {
			return {
				id: l,
				text: l,
				color: colorScale(l)
			};
		})),
		'',
		function(v) {
			selectedBroadTopic = v;
			graph.select();
			tagFieldCallbacks.update(getTagList());
			repaint();
		}
	);

	function getTagList() {
		var filteredNodes = nodes.filter(function(d) {
			return selectedBroadTopic == 'all' || d.category == selectedBroadTopic;
		})

		if (selectedLad != 'all') {
			var topicValues = {};

			dataWelshRCA.forEach(function(d) {
				if (d.year == selectedYear && d.lad == selectedLad) {
					topicValues[d.topic] = d.comparative_adv;
				}
			});

			filteredNodes = filteredNodes.filter(function(d) {
				return (topicValues[tags[d.id].topic.name] !== undefined && topicValues[tags[d.id].topic.name] > 0);
			});
		}

		filteredNodes = filteredNodes.map(function(d) { return { id: d.id, text: d.name }; });

		filteredNodes.sort(function(a, b) {
			if (a.text == b.text) return 0;
			else if (b.text < a.text) return 1;
			else return -1;
		});

		return [{ id: '', text: '' }].concat(filteredNodes);
	}

	var tagFieldCallbacks = filter.addSelectSearchSection(
		'Tag',
		getTagList(),
		'Search for tag',
		function(v) {
			selectedTag = v;
			graph.select(v);
		}
	);
			
	filter.addKeyTable(
		'Network',
		[
			{ type: 'circle', fill: 'rgb(110, 64, 170)', stroke: '#777', r: 3, desc: 'Tag' },
			{ type: 'line', color: '#ccc', desc: 'Co-occurrence of tags in meetup groups [?]' },
			{ type: 'desc', text: 'Circle size shows a number of times the tag has been used, color – a tag topic, opacity – LQ in the selected LAD [?]' },
			{ type: 'desc', text: 'Line thickness shows a number of times 2 tags have been used in the same meetup group [?]' }
		]);

	// filter by topics
});
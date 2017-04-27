// Explanation

var tooltip = new Tooltip();
tooltip.loadSteps([
	{
		text: 'We have mapped the tags used by UK tech communities to describe their interests',
		before: function(callback) {
			$('.filter').scrollTop(0);
			callback();
		},
		position: function() {
			return {
				target: '.filter__group:eq(0)',
				position: 'left-top'
			};
		}
	},
	{
		text: 'This network reveals interrelated topics such as Information Technology, Programming etc.',
		position: function() {
			return {
				target: '.filter input[name="topic"]',
				position: 'left-top',
			};
		}
	},
	{
		text: 'The network reveals the connections between topics. Some tech tags such as #web_design are highly connected with tags in other topics.',
		after: function(callback) {
			graph.select('web_design');
			callback();
		},
		position: function() {
			var tag = graph.getNode('web_design');
			return {
				target: tag,
				position: 'right',
				shift: 50
			};
		}
	},
	{
		text: 'Welsh local authorities have strong capabilities in the areas of Programming, Information Technology and Business.',
		position: function() {
			return {
				target: '.filter__group:eq(5)',
				position: 'left-bottom',
			};
		},
		before: function(callback) {
			graph.select();
			var container = $('.filter');
			var scrollTo = $('.filter__group:eq(5)');
			container.animate(
				{ scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() },
				500,
				callback
			);
		},
		after: function(callback) {
			ladFieldCallback.setValue('Wales', true);
			callback();
		}
	},
	{
		text: 'Over time, Wales has evolved its capabilities from tech topic Programming to tech topic Information Technology to tech topic Business',
		position: function() {
			return {
				target: '.filter__group:eq(6)',
				position: 'left',
			};
		},
		before: function(callback) {
			graph.select();
			var container = $('.filter');
			var scrollTo = $('.filter__group:eq(7)');
			container.animate(
				{ scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() },
				500,
				callback
			);
		},
		after: function(callback) {
			var values = yearCallback.getValues();
			var i = 0;
			function nextYear() {
				yearCallback.setValue(values[i++]);
				if (i < values.length)
					setTimeout(nextYear, 1000);
				else
					callback();
			}
			setTimeout(nextYear, 500);
		}
	},
	{
		text: 'Click on the nodes and use the filters to explore the network',
		before: function(callback) {
			ladFieldCallback.setValue('', true);
			callback();
		}
	}
]);


//

var width = window.innerWidth - 230,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var graph,
	tagFieldCallback,
	ladFieldCallback,
	yearCallback;

var datareader = new Datareader();


console.log('Data loading');

datareader.readData(Datareader.DATASETS.MeetupNetwork, function(years, lads, tags, topics, broadTopics, edges, nodes, dataLq) {
	console.log('Data loaded');
	d3.select('.vislayout__loading').remove();

	var selectedYear = years[years.length - 1];
	var selectedLad = '',
		selectedBroadTopic = '';
	var lqThreshold = 0;

	var maxLq = 4;//d3.max(dataLq, function(d) { return d.comparative_adv; });

	//console.log(years, lads, topics, tags, network);

	// prepare network
	var nodeHash = {};

	// process nodes
	nodes.forEach(function(node) {
		node.name = node.label;
		node.fullCategory = '{0}, {1}'.format(tags[node.id].topic.broad, tags[node.id].topic.name);
		node.value = tags[node.id] !== undefined ? tags[node.id].count : 0;
		node.category = tags[node.id] !== undefined ? tags[node.id].topic.broad : undefined;

		nodeHash[node.id] = node;
	});

	nodes.sort(function(a, b) {
		return b.value - a.value;
	});

	// find the most popular tags for each topic
	/*broadTopics.forEach(function(t) {
		var n = nodes.find(function(d) { return d.category == t; });
		n.labeled = true;
	})*/
	nodes.slice(0, 200).forEach(function(d) { d.labeled = true; });

	nodes.forEach(function(node) {
		// rotate the graph
		var tmp = node.x;
		node.x = node.y;
		node.y = tmp;

		node.name = node.label;
		node.fullCategory = '{0}, {1}'.format(tags[node.id].topic.broad, tags[node.id].topic.name);
		node.value = tags[node.id] !== undefined ? tags[node.id].count : 0;
		node.category = tags[node.id] !== undefined ? tags[node.id].topic.broad : undefined;

		nodeHash[node.id] = node;
	});

	edges.forEach(function(edge) {
		edge.source = nodeHash[edge.source];
		edge.target = nodeHash[edge.target];
		edge.value = parseFloat(edge.size);
	});

	graph = new Forcegraph(svg, nodes, edges, broadTopics, {
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
			hint.select('.vis__hint__count').text('Used {0} time{1}'.format(d.value, d.value != 1 ? 's' : ''));
			if (selectedLad == '')
				hint.select('.vis__hint__lq').text('');
			else
				hint.select('.vis__hint__lq').text('LQ [?] in {0}: {1}'.format(
					selectedLad,
					dataLq.find(function(d) {
						return d.year == selectedYear && (d.lad == selectedLad || (d.lad === undefined && selectedLad == 'Wales'));
					}).comparative_adv.abbrNum(3)
				));
		},
		selectNodeCallback: function(nodeId) {
			tagFieldCallback.setValue(nodeId);
		}
	});
	graph.draw();

	function repaint() {
		if (selectedLad == '' && selectedBroadTopic == '')
			graph.repaint();
		else
			graph.repaint(getTagList());
	}

	// Filter
	var filter = new Filter(d3.select('.filter'));

	filter.addText('Network', 'The network shows co-occurrence of tags in meetup groups in Wales and the UK [?]');

	filter.addKeyTable(
		'',
		[
			{ type: 'circle', fill: 'rgb(110, 64, 170)', stroke: '#777', r: 3, desc: 'Tag. Area – number of times the tag has been used.' },
			{ type: 'line', color: '#ccc', desc: 'Co-occurrence of tags in meetup groups [?]. Thickness – number of times 2 tags have been used in the same meetup group [?]' },
		]);

	var colorScale = ColorPalette.ordinal(broadTopics).scale;

	filter.addRadioSection(
		'Topics',
		[{ value: '', name: 'topic', label: 'All topics', checked: true }].concat(broadTopics.map(function(l) {
			return {
				value: l,
				label: l,
				name: 'topic',
				color: colorScale(l)
			};
		})),
		function(v) {
			selectedBroadTopic = v;
			graph.select();
			tagFieldCallback.update(getTagList(true));
			repaint();
		}
	);

	tagFieldCallback = filter.addSelectSearchSection(
		'',
		getTagList(true),
		'Search for tag',
		function(v) {
			selectedTag = v;
			graph.select(v);
		}
	);

	filter.addText('Comparative advantage', 'Choose a district to see it\'s comparative advantage in topics [?]');

	ladFieldCallback = filter.addSelectSearchSection(
		'',
		[{ id: '', text: '' }, { id: 'Wales', text: 'All Wales [?]' }].concat(lads.map(function(l) { return { id: l, text: l }; })),
		'Choose LAD',
		function(v) {
			selectedLad = v;
			graph.select();
			tagFieldCallback.update(getTagList(true));
			repaint();
			yearCallback.show(v != '');
			lqCallback.show(v != '');
		}
	);
	
	yearCallback = filter.addDiscreteSlider(
		'Year',
		years,
		selectedYear,
		function(v) {
			selectedYear = v;
			graph.select();
			repaint();
		}
	);
	yearCallback.show(false);
	
	var lqCallback = filter.addMinSlider(
		'Minimum LQ [?]',
		0,
		maxLq,
		lqThreshold,
		function(v) {
			lqThreshold = v;
			graph.select();
			repaint();
		}
	);
	lqCallback.show(false);

	// ---

	function getTagList(formated) {
		var tagList;

		if (selectedLad == '' && selectedBroadTopic == '') {
			tagList = nodes.map(function(d) { return d.name; });
		}
		else if (selectedLad != '') {
			tagList = [];
			dataLq.forEach(function(d) {
				if (d.year == selectedYear &&
					tags[d.tag] !== undefined &&
					nodeHash[d.tag] !== undefined &&
					(d.lad == selectedLad || (d.lad === undefined && selectedLad == 'Wales')) &&
					(selectedBroadTopic == '' || tags[d.tag].topic.broad == selectedBroadTopic) &&
					d.comparative_adv > lqThreshold) {

					tagList.push(d.tag);
				}
			});
		}
		else {
			tagList = nodes.filter(function(d) { return d.category == selectedBroadTopic; }).map(function(d) { return d.name; });
		}

		if (!formated)
			return tagList;
		else {
			tagList.sort();
			return [{ id: '', text: '' }].concat(tagList.map(function(d) { return { id: d, text: d }; }));
		}
	}

	tooltip.startTour();
});
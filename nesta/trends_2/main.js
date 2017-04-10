var width = 1100,
	height = 900;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.HotTrends, function(years, lads, topics, data) {
	var selectedVariable = 'attendants',
		selectedLad = 'Cardiff',
		selectedTopic = '';

	var bumpchart;
	var lines;


	function calculateRank(data) {
		years.forEach(function(y) {
			var currentData = data.filter(function(d) {
				return d.year == y;
			});

			currentData.sort(function(a, b) {
				return b[selectedVariable] - a[selectedVariable];
			});

			currentData.forEach(function(d, i) { d.position = i + 1; });
		});
	}

	function filterData() {
		return data.filter(function(d) {
			return d.lad == selectedLad;
		});
	}

	function getTopics() {
		var fData = filterData();
		var topics = {
			'': '',
		};
		fData.map(function(d) { topics[d.topic] = { id: d.topic, text: d.topic }; });
		return Object.keys(topics).map(function(d) { return topics[d]; }).sort(function(a, b) { return a < b ? -1 : 1});
	}

	function groupLines(data) {
		var lines = {};
		data.forEach(function(d) {
			if (lines[d.topic] === undefined)
				lines[d.topic] = {
					name: d.topic,
					values: []
				}

			lines[d.topic].values.push({
				year: d.year,
				position: d.position,
				value: selectedVariable == 'comparative_adv' ? d[selectedVariable].abbrNum(2) : d[selectedVariable].separate(),
			});
		});
		Object.keys(lines).forEach(function(d) { lines[d].values.sort(function(a, b) { return a.year - b.year; }) }); // sort values by year
		return Object.keys(lines).map(function(d) { return lines[d]; });
	}

	function drawChart() {
		var fData = filterData();
		calculateRank(fData);
		lines = groupLines(fData);
		
		bumpchart = new Bumpchart(svg, years, lines, {
			leftMargin: 200,
			rightMargin: 150,
			bottomMargim: 150,
			onItemSelect: onItemSelect,
		});
		bumpchart.draw();
	}
	drawChart();


	// Filter
	var filter = new Filter(d3.select('.filter'));
	filter.addRadioSection(
		'Rank by',
		[
			{ value: 'attendants', label: 'Number of attendants', checked: true },
			{ value: 'events', label: 'Number of events' },
			{ value: 'comparative_adv', label: 'Comparative advantage (LQ) [?]' }
		],
		function(v) {
			selectedVariable = v;
			drawChart();
		}
	);

	filter.addSelectSearchSection(
		'Local Authority District',
		lads.map(function(l) { return { id: l, text: l }; }),
		'',
		function(v) {
			selectedLad = v;
			bumpchart.select();
			topicCallbacks.update(getTopics());
			drawChart();
		},
		selectedLad
	);
	
	var topicCallbacks = filter.addSelectSearchSection(
		'Topic',
		getTopics(),
		'Search for topic',
		function(v) {
			selectedTopic = v;
			bumpchart.select(lines.find(function(l) { return l.name == v; })); // FIX search by id/name, not by object
		}
	);

	function onItemSelect(item) {
		topicCallbacks.setValue(item.name);
	}
});
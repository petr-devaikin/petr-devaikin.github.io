var width = 1100,
	height = 900;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.TopicActivity, function(lads, disciplines, topics, years, data) {
	lads.sort();

	var selectedVariable = 'count',
		selectedLad = 'all',
		selectedDiscipline = 'all',
		selectedTopic = '';

	var bumpchart;
	var lines;

	function drawChart() {
		function calculateRank(data) {
			years.forEach(function(y) {
				var currentData = data.filter(function(d) {
					return d.year == y;
				});

				currentData.sort(function(a, b) {
					if (selectedLad == 'all')
						return b.value - a.value;
					else
						return b.ladValues[selectedLad] - a.ladValues[selectedLad];
				});

				currentData.forEach(function(d, i) { d.position = i + 1; });
			});
		}

		function filterData() {
			return data.filter(function(d) {
				return d.variable == selectedVariable &&
					(selectedDiscipline != 'all' ? d.discipline == selectedDiscipline : true);
			});
		}

		function groupLines(data) {
			var lines = {};
			data.forEach(function(d) {
				if (lines[d.topic] === undefined)
					lines[d.topic] = {
						name: d.topic,
						values: []
					}

				lines[d.topic].values.push({ position: d.position });
			});
			return Object.keys(lines).map(function(d) { return lines[d]; });
		}

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
			{ value: 'count', label: 'Count (?)', checked: true },
			{ value: 'funding', label: 'Funding' }
		], function(v) {
			selectedVariable = v;
			drawChart();
		});

	filter.addSelectSearchSection(
		'Local Authority District',
		[{ id: 'all', text: 'All' }].concat(lads.map(function(l) { return { id: l, text: l }; })),
		'',
		function(v) {
			selectedLad = v;
			drawChart();
		});

	filter.addSelectSearchSection(
		'Discipline',
		[{ id: 'all', text: 'All' }].concat(disciplines.map(function(l) { return { id: l, text: l }; })),
		'',
		function(v) {
			selectedDiscipline = v;

			bumpchart.select();

			updateSelectTopics();

			drawChart();
		});

	function updateSelectTopics() {
		var filteredTopics = topics.filter(function(d) {
			return selectedDiscipline == 'all' || d.discipline == selectedDiscipline;
		});
		var newData = [{ id: '', text: '' }].concat(filteredTopics.map(function(l) { return { id: l.name, text: l.name }; }));
		topicCallbacks.update(newData);
	}
	
	var topicCallbacks = filter.addSelectSearchSection(
		'Topic',
		[{ id: '', text: '' }].concat(topics.map(function(l) { return { id: l.name, text: l.name }; })),
		'Search for topic',
		function(v) {
			selectedTopic = v;
			bumpchart.select(lines.find(function(l) { return l.name == v; }));
		});

	function onItemSelect(item) {
		topicCallbacks.setValue(item.name);
	}
});
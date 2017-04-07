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
		selectedDiscipline = '',
		selectedTopic = '';

	var bumpchart;
	var lines;

	function drawChart() {
		function calculateRank(data) {
			years.forEach(function(y) {
				var currentData = data.filter(function(d) {
					return d.year == y && d.variable == selectedVariable &&
						(selectedDiscipline != '' ? d.discipline == selectedDiscipline : true);
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
					(selectedDiscipline != '' ? d.discipline == selectedDiscipline : true);
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
		[{ value: 'all', label: 'All' }].concat(lads.map(function(l) { return { value: l, label: l }; })),
		'',
		function(v) {
			selectedLad = v;
			drawChart();
		});

	filter.addSelectSearchSection(
		'Discipline',
		[{ value: 'all', label: 'All' }].concat(disciplines.map(function(l) { return { value: l, label: l }; })),
		'',
		function(v) {
			selectedDiscipline = v;
			drawChart();
		});

	/*
	filter.addSelectSearchSection(
		'Topic',
		[{ value: '', label: '' }].concat(topics.map(function(l) { return { value: l.name, label: l.name }; })),
		'Search for topic',
		function(v) {
			selectedTopic = v;
			bumpchart.select(lines.find(function(l) { return l.name == v; }));
		});
	*/
});
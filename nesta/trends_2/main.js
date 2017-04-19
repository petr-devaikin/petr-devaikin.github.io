var width = window.innerWidth - 230,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.HotTrends, function(years, lads, topics, data) {
	var selectedLad = 'Cardiff',
		selectedTopic = '';

	var bumpchart;
	var lines;

	function calculateRank(data) {
		for (var i = years.length - 1; i >= 0; i--) {
			y = years[i];

			var currentData = data.filter(function(d) { return d.year == y; });
			var nextYearData;
			if (i < years.length - 1)
				nextYearData = data.filter(function(d) { return d.year == years[i + 1]; });

			currentData.sort(function(a, b) {
				var aValue, bValue;
				aValue = a.comparative_adv;
				bValue = b.comparative_adv;

				if (aValue == bValue && i < years.length - 1) { // copy ranking from the next year
					//if (y == 2013) console.log(a, b);
					var aNextPosition = nextYearData.find(function(d) { return d.topic == a.topic; });
					var bNextPosition = nextYearData.find(function(d) { return d.topic == b.topic; });
					//if (y == 2013) console.log(aNextPosition, bNextPosition);
					return aNextPosition.position - bNextPosition.position;
				}
				else
					return bValue - aValue;
			});

			currentData.forEach(function(d, i) { d.position = i + 1; });
		}
	}

	function calculateMax(data) {
		return d3.max(data, function(d) { return d.attendants; });
	}

	function filterData() {
		return data.filter(function(d) {
			return d.lad == selectedLad;
		});
	}

	/*
	function getTopics() {
		var fData = filterData();
		var topics = {
			'': '',
		};
		fData.map(function(d) { topics[d.topic] = { id: d.topic, text: d.topic }; });
		return Object.keys(topics).map(function(d) { return topics[d]; }).sort(function(a, b) { return a < b ? -1 : 1});
	}*/

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
				secondValue: d.attendants,
				value: d.comparative_adv.abbrNum(2),
			});
		});
		Object.keys(lines).forEach(function(d) { lines[d].values.sort(function(a, b) { return a.year - b.year; }) }); // sort values by year
		return Object.keys(lines).map(function(d) { return lines[d]; });
	}

	function drawChart() {
		var fData = filterData();
		var maxSecondValue = calculateMax(fData);

		calculateRank(fData);
		lines = groupLines(fData);

		scaleCallbacks.update(0, maxSecondValue);
		
		bumpchart = new Bumpchart(svg, years, lines, {
			leftMargin: 200,
			rightMargin: 200,
			topMargin: 50,
			//onItemSelect: onItemSelect,
			legendSteps: 4,
			showOverview: false,
			addHint: function(h, d) {
				h.append('text').classed('vis__hints__hint__name', true).style('font-weight', 'bold');
				h.append('text').classed('vis__hints__hint__position', true).attr('dy', 12);
				h.append('text').classed('vis__hints__hint__lq', true).attr('dy', 24);
				h.append('text').classed('vis__hints__hint__attendants', true).attr('dy', 36);
			},
			setHintContent: function(h, line, d, isFirst, isLast, isVisible) {
				if ((isFirst || isLast) && !isVisible)
					h.select('.vis__hints__hint__name').text(line.name);
				else
					h.select('.vis__hints__hint__name').text('');
				h.select('.vis__hints__hint__position').text('Position: ' + d.position);
				h.select('.vis__hints__hint__lq').text('LQ: ' + d.value);
				h.select('.vis__hints__hint__attendants').text('Attendants: ' + d.secondValue);
			}
		});
		bumpchart.draw();
	}

	// Filter
	var filter = new Filter(d3.select('.filter'));
	/*filter.addRadioSection(
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
	);*/

	filter.addSelectSearchSection(
		'Local Authority District',
		lads.map(function(l) { return { id: l, text: l }; }),
		'',
		function(v) {
			selectedLad = v;
			bumpchart.select();
			//topicCallbacks.update(getTopics());
			drawChart();
		},
		selectedLad
	);
	
	/*
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
		topicCallbacks.setValue(item === undefined ? '' : item.name);
	}
	*/

	var scaleCallbacks = filter.addDiscreteColorScale('Number of attendants', 0, 10, 4);


	drawChart();
});
var width = window.innerWidth - 230,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.HotTrends, function(years, lads, topics, broadTopics, data) {
	var selectedLad = 'Cardiff',
		selectedTopic = '';

	var bumpchart;
	var lines;

	console.log(broadTopics.length);

	function processData(data) {
		data.forEach(function(d) {
			d.name = d.topic.name;
			d.category = d.topic.broad;
			d.value = d.comparative_adv;
			d.secondValue = d.attendants; // ???
			d.x = d.year;
		});
	}
	processData(data);

	function calculateMax(data) {
		return d3.max(data, function(d) { return d.secondValue; });
	}

	function filterData() {
		return data.filter(function(d) {
			return d.lad == selectedLad;
		});
	}

	function drawChart() {
		var fData = filterData();
		var maxSecondValue = calculateMax(fData);
		
		bumpchart = new Bumpchart(svg, years, fData, {
			leftMargin: 200,
			rightMargin: 200,
			topMargin: 50,
			//onItemSelect: onItemSelect,
			legendSteps: 4,
			showOverview: false,
			categories: broadTopics,
			addHint: function(h, d) {
				h.append('text').classed('vis__hints__hint__name', true).style('font-weight', 'bold');
				h.append('text').classed('vis__hints__hint__position', true).attr('dy', 12);
				h.append('text').classed('vis__hints__hint__lq', true).attr('dy', 24);
				h.append('text').classed('vis__hints__hint__attendants', true).attr('dy', 36);
				h.append('text').classed('vis__hints__hint__events', true).attr('dy', 48);
			},
			setHintContent: function(h, line, d, isFirst, isLast, isVisible) {
				if ((isFirst || isLast) && !isVisible)
					h.select('.vis__hints__hint__name').text(line.name);
				else
					h.select('.vis__hints__hint__name').text('');
				h.select('.vis__hints__hint__position').text('Position: ' + d.position);
				h.select('.vis__hints__hint__lq').text('LQ: ' + d.value);
				h.select('.vis__hints__hint__attendants').text('Attendants: ' + d.secondValue);
				h.select('.vis__hints__hint__events').text('Events: ' + d.events);
			}
		});
		bumpchart.draw();
	}

	// Filter
	var filter = new Filter(d3.select('.filter'));

	filter.addText('', 'The ranking of topics is based on the comparative advantage (LQ) in the selected district [?].');
	filter.addText('', 'Colour of line shows a topic group [?]');
	filter.addText('', 'Thickness of line represents a number of attendants at the events covering the topic [?]');
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

	//var scaleCallbacks = filter.addDiscreteColorScale('Number of attendants', 0, 10, 4);


	drawChart();
});
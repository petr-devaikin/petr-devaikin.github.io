var width = window.innerWidth - 230,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.HotTrends, function(years, lads, topics, broadTopics, data) {
	var selectedLad = 'Cardiff',
		selectedTopic = '',
		selectedVariable = 'attendants';

	var bumpchart;

	function processData(data) {
		data.forEach(function(d) {
			d.name = d.topic.name;
			d.category = d.topic.broad;
			d.value = d.comparative_adv;
			d.secondValue = d[selectedVariable];
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
				h.select('.vis__hints__hint__lq').text('LQ: ' + d.value.abbrNum(2));
				h.select('.vis__hints__hint__attendants').text('Attendants: ' + d.secondValue);
				h.select('.vis__hints__hint__events').text('Events: ' + d.events);
			}
		});
		bumpchart.draw();
	}
	drawChart();

	// Filter
	var filter = new Filter(d3.select('.filter'));

	filter.addText('Ranking', 'The ranking of topics is based on the comparative advantage (LQ) in the selected district [?].');
	
	filter.addText('Groups', 'Colour of a line represents the topic group [?]');
	var groupPalette = ColorPalette.ordinal(broadTopics);
	filter.addKeyTable('', broadTopics.map(function(d) {
		return { type: 'color', color: groupPalette.scale(d), text: d };
	}));

	filter.addText('Level of Activity', 'Thickness of a line represents level of activity for the topic, i.e. number of events or number of attendants at the events covering the topic [?]');
	
	filter.addRadioSection(
		'',
		[
			{ value: 'attendants', name: 'val', label: 'Number of attendants', checked: true },
			{ value: 'events', name: 'val', label: 'Number of events' }
		],
		function(v) {
			selectedVariable = v;
			processData(data);
			drawChart();
			thicknessCallback.update(bumpchart.getMinSecondValue(), bumpchart.getMaxSecondValue());
		}
	);

	var thicknessCallback = filter.addThicknessKey('', bumpchart.getMinSecondValue(), bumpchart.getMaxSecondValue(),
		bumpchart.getParams().lineMinHeight, bumpchart.getParams().lineMaxHeight, groupPalette.scale(broadTopics[0]));

	filter.addSelectSearchSection(
		'Local Authority District',
		lads.map(function(l) { return { id: l, text: l }; }),
		'',
		function(v) {
			selectedLad = v;
			processData(data);
			drawChart();
			thicknessCallback.update(bumpchart.getMinSecondValue(), bumpchart.getMaxSecondValue());
		},
		selectedLad
	);
});
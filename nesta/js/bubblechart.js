function Bubblechart(svg, xValues, yValues, rValues, data, p) {
	var params = {
		leftMargin: 100,
		rightMargin: 20,
		topMargin: 20,
		graphWidth: 500,
		graphHeight: 600,
		showLegend: true,
		showLeftAxis: true,
		showRightAxis: false,
		showTopAxis: false,
		showBottomAxis: true,
		leftLabel: '',
		bottomLabel: '',
		rLabel: '',
		useLogXScale: false,
		useLogYScale: false,
		categories: [],
		maxCircleArea: 200,
		sampleCount: 7,
		addHintContent: undefined,
		updateHintContent: undefined,
		transitionDuration: 500,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var graphAreaBg,
		graphAreaActive,
		hintsArea;

	var xScale,
		yScale,
		rScale;

	var hint;

	this.draw = function() {
		svg.attr('class', 'vis vis--bubblechart');

		/*function addClipRect() {
			svg.append('defs').append('clipPath').attr('id', 'graph-clip')
				.append('rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', params.graphWidth)
					.attr('height', params.graphHeight);
		}
		addClipRect();*/

		var leftAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		var bottomAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin + params.graphHeight))
			.classed('vis__axis vis__axis--bottom', true);

		var graphArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__graph', true)
			.attr('clip-path', 'url(#graph-clip)');

		graphAreaBg = graphArea.append('g')
			.classed('vis__graph__bg', true);
		graphAreaActive = graphArea.append('g')
			.classed('vis__graph__active', true);

		hintsArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__hints', true);

		xScale = (params.useLogXScale ? d3.scaleLog() : d3.scaleLinear())
			.domain([xValues[0], xValues[1]])
			.range([30, params.graphWidth]);

		yScale = (params.useLogYScale ? d3.scaleLog() : d3.scaleLinear())
			.domain([yValues[1], yValues[0]])
			.range([0, params.graphHeight]);

		var rSampleValues = [];
		for (var i = 0; i < params.sampleCount; i++)
			rSampleValues.push(Math.sqrt(params.maxCircleArea / params.sampleCount * (i + 0.5)));
		rScale = d3.scaleQuantize()
			.domain([0, rValues[1]])
			.range(rSampleValues);

		
		addHint();

		function drawAxes() {
			bottomAxis.call(d3.axisBottom(xScale).ticks(20, ",.1s"));
			leftAxis.call(d3.axisLeft(yScale).ticks(20, ",.1s"));

			bottomAxis.append('text')
				.classed('axis-label', true)
				.attr('transform', 'translate({0},{1})'.format(params.graphWidth / 2, 40))
				.attr('text-anchor', 'middle')
				.text(params.bottomLabel);

			leftAxis.append('text')
				.classed('axis-label', true)
				.attr('transform', 'translate({0},{1}) rotate(-90)'.format(-50, params.graphHeight / 2))
				.attr('text-anchor', 'middle')
				.text(params.leftLabel);
		}
		drawAxes();


		function drawData() {
			redraw(data);
		}
		drawData();


		function selectCategory(categoryName) {
			graphArea.selectAll('.vis__graph__item')
				.classed('selected', function(d) {
					return d.category == categoryName || categoryName == 'all';
				});
		}

		function highlightCategory(categoryName) {
			graphArea.selectAll('.vis__graph__item')
				.classed('highlighted', function(d) {
					if (categoryName === undefined)
						return false;
					else 
						return d.category == categoryName || categoryName == 'all';
				});

			graphArea.selectAll('.vis__graph__item')
				.classed('blured', function(d) {
					if (categoryName === undefined)
						return false;
					else 
						return d.category != categoryName && categoryName != 'all';
				});
		}

		
		function drawLegend() {
			var legend = d3.select('.m-legend');

			legend.append('h1').text('Categories');

			legend.append('label')
				.classed('m-legend__category', true)
				.text('All')
				.on('mouseover', function(d) { highlightCategory('all'); })
				.on('mouseout', function(d) { highlightCategory(); })
				.append('input')
					.attr('type', 'radio')
					.attr('value', 'all')
					.attr('name', 'category')
					.attr('checked', 'checked')
					.on('change', function(d) { selectCategory('all'); })
					.on('mouseover', function(d) { highlightCategory('all'); })
					.on('mouseout', function(d) { highlightCategory(); });

			var categories = legend.selectAll('.m-legend__category').data(params.categories).enter()
				.append('label')
					.classed('m-legend__category', true)
					.text(function(d) { return d; })
					.on('mouseover', function(d) { highlightCategory(d); })
					.on('mouseout', function(d) { highlightCategory(); });

			categories.append('input')
				.attr('type', 'radio')
				.attr('name', 'category')
				.attr('value', function(d) { return d; })
				.on('change', function(d) { selectCategory(d); })
				.on('mouseover', function(d) { highlightCategory(d); })
				.on('mouseout', function(d) { highlightCategory(); });

			legend.append('h1').text('Value per project [UNITS?]');


			var legendSamples = [];
			for (var i = 0; i < params.sampleCount; i++)
				legendSamples.push({
					min: rValues[1] / params.sampleCount * i,
					max: rValues[1] / params.sampleCount * (i + 1),
					avg: rValues[1] / params.sampleCount * (i + .5)
				});
			console.log(legendSamples);
			legend.selectAll('.m-legend__size').data(legendSamples).enter().append('div')
				.classed('m-legend__size', true)
				.text(function(d) {
					return d.avg < 1000000 ? d.avg.abbrNum(-2) : d.avg.abbrNum();
				})
				.append('div')
					.classed('m-legend__size__sample', true)
					.style('width', function(d) { return rScale(d.avg) * 2 + 'px'; })
					.style('height', function(d) { return rScale(d.avg) * 2 + 'px'; })
					.style('left', function(d) { return (30 / 2 - rScale(d.avg)) + 'px'; });
		}
		if (params.showLegend) drawLegend();
	}

	// HINT

	function addHint() {
		hint = hintsArea.append('g')
			.classed('vis__hints__hint', true)
			.attr('visibility', 'hidden');
		hint.append('rect').classed('vis__hints__hint__bg', true);

		if (params.addHintContent === undefined) { // <--------------- FIX THIS
			hint.append('text').classed('vis__hints__hint__name', true);
			hint.append('text').classed('vis__hints__hint__category', true).attr('dy', 15);
			hint.append('text').classed('vis__hints__hint__value--all', true).attr('dy', 40);
			hint.append('text').classed('vis__hints__hint__value', true).attr('dy', 55);
			hint.append('text').classed('vis__hints__hint__number--all', true).attr('dy', 70);
			hint.append('text').classed('vis__hints__hint__number', true).attr('dy', 85);
		}
		else
			params.addHintContent(hint);
	}

	function showHint(d) {
		d3.select(this).classed('hovered', true);

		hint.select('.vis__hints__hint__bg').attr('x', 0).attr('y', 0).attr('width', 0).attr('height', 0);

		if (params.updateHintContent === undefined) { // <---------------- FIX THIS
			hint.select('.vis__hints__hint__category').text('Category: ' + d.category);
			hint.select('.vis__hints__hint__name').text('Project [!]: ' + d.name);
			hint.select('.vis__hints__hint__value').text('Value per project in Wales: ' + Math.round(d.r) + ' [UNITS?]');
			hint.select('.vis__hints__hint__value--all').text(
				'Value per project in [UK?]: {0} [UNITS?]'.format( 
					Math.round((d.value.welsh + d.value.nonWelsh) / (d.projects.welsh + d.projects.nonWelsh))
				)
			);
			hint.select('.vis__hints__hint__number').text(
				'Number of projects in Wales: {0} ({1}%)'.format(d.projects.welsh, Math.round(d.y * 100))
			);
			hint.select('.vis__hints__hint__number--all').text('Number of projects in [UK?]: ' + (d.projects.nonWelsh + d.projects.welsh));
		}
		else
			params.updateHintContent(hint, d);

		var bbox = hint.node().getBBox();

		hint.select('.vis__hints__hint__bg')
			.attr('x', -5)
			.attr('y', -5)
			.attr('width', bbox.width + 10)
			.attr('height', bbox.height + 10);

		hint
			.attr('transform', 'translate({0},{1})'.format(xScale(d.x) - bbox.width / 2, yScale(d.y) + rScale(d.r) + 10))
			.attr('visibility', 'visible');
	}

	function hideHint(d) {
		d3.select(this).classed('hovered', false);
		hint.attr('visibility', 'hidden');
	}


	// REDRAW 

	function redraw(data) {
		var t = d3.transition()
		    .duration(params.transitionDuration)
		    .ease(d3.easeLinear);

		data.sort(function(a, b) { return b.r - a.r; });

		function setBubble(selection) {
			selection
				.attr('transform', function(d) { return 'translate({0},{1})'.format(xScale(d.x), yScale(d.y)); })
				.attr('r', function(d) { return rScale(d.r); });
		}

		var bgBubbles = graphAreaBg.selectAll('.vis__graph__item').data(data, function(d, i) { return d.id === undefined ? i : d.id; });
		var activeBubbles = graphAreaActive.selectAll('.vis__graph__item').data(data, function(d, i) { return d.id === undefined ? i : d.id; });

		bgBubbles.transition(t).call(setBubble);
		activeBubbles.transition(t).call(setBubble);


		var newBgBubbles = bgBubbles.enter().append('circle');
		newBgBubbles
			.classed('vis__graph__item', true)
			.on('mouseover', showHint)
			.on('mouseout', hideHint)
			.classed('selected', true);

		var newActiveBubbles = activeBubbles.enter().append('circle');
		newActiveBubbles
			.classed('vis__graph__item', true)
			.on('mouseover', showHint)
			.on('mouseout', hideHint)
			.classed('selected', true);

		newBgBubbles.call(setBubble);
		newActiveBubbles.call(setBubble);
	}

	this.redraw = redraw;
}


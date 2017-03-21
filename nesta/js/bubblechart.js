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
		useLogXScale: false,
		useLogYScale: false,
		categories: [],
		minRadius: 0,
		maxRadius: 15,
		legendSteps: 7,
		legendRoundTo: 4,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	console.log(rValues);

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

		var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
			.domain(params.categories);

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

		var hintsArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__hints', true);

		var xScale = (params.useLogXScale ? d3.scaleLog() : d3.scaleLinear())
			.domain([xValues[0], xValues[1]])
			.range([50, params.graphWidth]);

		var yScale = (params.useLogYScale ? d3.scaleLog() : d3.scaleLinear())
			.domain([yValues[1], yValues[0]])
			.range([0, params.graphHeight]);

		var rScale = d3.scaleSqrt()
			.domain([0, rValues[1]])
			.range([params.minRadius, params.maxRadius]);

		
		var hint = hintsArea.append('g')
			.classed('vis__hints__hint', true)
			.attr('visibility', 'hidden');
		hint.append('text');

		function showHint(d) {
			hint.select('text')
				.text('{0}. Proj: {1} / {2}. Value: {3}'.format(d.name, d.projects.welsh, d.projects.nonWelsh, d.value.welsh));
			hint
				.attr('transform', 'translate({0},{1})'.format(xScale(d.x), yScale(d.y)))
				.attr('visibility', 'visible');
		}

		function hideHint(d) {
			hint.attr('visibility', 'hidden');
		}


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
			graphArea.selectAll('.vis__graph__item').data(data).enter().append('circle')
				.classed('vis__graph__item', true)
				.attr('transform', function(d) { return 'translate({0},{1})'.format(xScale(d.x), yScale(d.y)); })
				.attr('fill', function(d) { return colorScale(d.category); })
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', function(d) { return rScale(d.projects.welshProportion); })
				.on('mouseover', showHint)
				.on('mouseout', hideHint);
		}
		drawData();

		
		function drawLegend() {
			var legend = d3.select('.m-legend');

			legend.append('h1').text('Categories');

			var categories = legend.selectAll('.m-legend__category').data(params.categories).enter()
				.append('label')
					.classed('m-legend__category', true)
					.style('border-left-color', function(d) { return colorScale(d); })
					.text(function(d) { return d; });

			categories.append('input')
				.attr('type', 'checkbox')
				.attr('value', function(d) { return d; })
				.attr('checked', 'checked')
				.on('change', function(d) {
					d3.selectAll('.vis__graph__item').filter(function(dd) { return dd.category == d; })
						.attr('visibility', this.checked ? 'visiblie' : 'hidden');
				});

			legend.append('h1').text('Number of project. Welsh proportion');

			var sizes = [];

			for (var i = 0; i < params.legendSteps; i++)
				sizes[i] = rValues[0] + (rValues[1] - rValues[0]) * Math.pow(i / (params.legendSteps - 1), 2);

			var multiplicator = Math.pow(10, params.legendRoundTo);

			legend.append('div')
				.text(Math.round(sizes[0] * multiplicator) / multiplicator + ' - ' + sizes[params.legendSteps - 1]);

			legend.selectAll('.m-legend__size').data(sizes).enter().append('div')
				.classed('m-legend__size', true)
				.style('width', function(d) { return rScale(d) * 2 + 'px'; })
				.style('height', function(d) { return rScale(d) * 2 + 'px'; });
		}
		if (params.showLegend) drawLegend();
	}
}


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
		minRadius: 1,
		maxRadius: 10,
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
			.range([0, params.graphWidth]);

		var yScale = (params.useLogYScale ? d3.scaleLog() : d3.scaleLinear())
			.domain([yValues[1], yValues[0]])
			.range([0, params.graphHeight]);

		var rScale = d3.scaleSqrt()
			.domain(rValues)
			.range([params.minRadius, params.maxRadius]);

		/*
		function showHints(line) {
			function setHintPosition(d, i) {
				if (d === undefined)
					return '';
				return 'translate({0},{1})'.format(xScale(i), (d.position <= params.showTop) ? yScale(d.position) : yScale(params.showTop + 0.5));
			}

			var hints = hintsArea.selectAll('.vis__hints__hint').data(line.values);
			hints
				.attr('transform', setHintPosition)
				.attr('visibility', function(d) { return (d !== undefined) ? 'visible' : 'hidden'; });
			hints.select('text').text(function(d) { return (d !== undefined) ? d.position : ''; });

			hints.exit().remove();
			var newHints = hints.enter().append('g')
				.classed('vis__hints__hint', true)
				.attr('transform', setHintPosition)
				.attr('visibility', function(d) { return (d !== undefined) ? 'visible' : 'hidden'; });
			
			newHints.append('path')
				.attr('d', 'M0 0 L-5 -5 L-20 -5 L-20 -20 L20 -20 L20 -5 L5 -5 Z');
			newHints.append('text')
				.attr('dy', -5)
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'after-edge')
				.text(function(d) { return (d !== undefined) ? d.position : ''; });

			graphArea.selectAll('.vis__graph__line')
				.classed('blured', function(d) { return d != line; });

			function blurTicks(axis, names) {
				axis.selectAll('.tick')
					.classed('blured', function(d, i) { return names[d] != line; })
			}
			blurTicks(leftAxis, leftNames);
			blurTicks(rightAxis, rightNames);
		}

		function hideHints() {
			hintsArea.selectAll('.vis__hints__hint').attr('visibility', 'hidden');
			graphArea.selectAll('.vis__graph__line.blured').classed('blured', false);

			leftAxis.selectAll('.tick.blured').classed('blured', false)
			rightAxis.selectAll('.tick.blured').classed('blured', false)
		}*/


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
				.attr('transform', function(d) { return 'translate({0},{1})'.format(xScale(d.x + 1), yScale(d.y + 1)); })
				.attr('fill', function(d) { return colorScale(d.category); })
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', function(d) { return rScale(d.projects.welshProportion); });
		}
		drawData();

		
		function drawLegend() {
			var legend = d3.select('.m-legend');

			legend.append('h1').text('Categories');

			var categories = legend.selectAll('.m-legend__category').data(params.categories).enter()
				.append('div')
					.classed('m-legend__category', true)
					.style('border-left-color', function(d) { return colorScale(d); })
					.text(function(d) { return d; });
			
		}
		if (params.showLegend) drawLegend();
	}
}


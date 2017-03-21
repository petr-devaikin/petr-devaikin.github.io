function Bubblechart(svg, xValues, yValues, data, p) {
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
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });


	this.draw = function() {
		svg.attr('class', 'vis vis--bubblechart');

		function addClipRect() {
			svg.append('defs').append('clipPath').attr('id', 'graph-clip')
				.append('rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', params.graphWidth)
					.attr('height', params.graphHeight);
		}
		addClipRect();

		var leftAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		var bottomAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin + graphHeight))
			.classed('vis__axis vis__axis--bottom', true);

		var graphArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__graph', true)
			.attr('clip-path', 'url(#graph-clip)');

		var hintsArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__hints', true);

		var xScale = d3.scaleLinear()
			.domain([xValues[0] - 1, xValues[1] + 1])
			.range([0, params.graphWidth]);

		var yScale = d3.scaleLinear()
			.domain([yValues[0] - 1, yValues[1] + 1])
			.range([0, params.graphHeight]);

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
			bottomAxis.call(d3.axisBottom(xScale));
			leftAxis.call(d3.axisLeft(yScale));
		}
		drawAxes();


		function drawData() {
			graphArea.selectAll('.vis__graph__item').data(data).enter().append('circle')
				.classed('vis__graph__item', true)
				.attr('transform', function(d) { return 'translate({0},{1})'.format(xScale(d.x), yScale(d.y)); })
				.attr('fill', function(d) { return rgba(0, 0, 0, 100); })
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', 10);
		}
		drawData();

		/*
		function drawLegend() {
			var legend = svg.append('g')
				.classed('vis__legend', true)
				.attr('transform', 'translate({0},{1})'.format(params.graphWidth + params.leftMargin + params.rightMargin + 50, params.topMargin));

			var legendWidth = params.legendSteps * params.legendSampleWidth;
			legend.append('rect')
				.classed('vis__legend__bg', true)
				.attr('width', 20 + legendWidth)
				.attr('height', params.legendSampleWidth + 50);

			legend.append('text') // <-- FIX
				.attr('transform', 'translate({0},{1})'.format(10, 20))
				.text('Change in ranking');

			var steps = [];
			for (var i = 0; i < params.legendSteps; i++)
				steps.push(-maxChange + maxChange * 2 / (params.legendSteps - 1) * i);

			legend.selectAll('vis__legend__sample').data(steps).enter().append('rect')
				.classed('vis__legend__sample', true)
				.attr('fill', function(d) { return colorScale(d / maxChange); })
				.attr('width', params.legendSampleWidth)
				.attr('height', params.legendSampleWidth)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format(10 + i * params.legendSampleWidth, 30);
				});

			var multiplicator = Math.pow(10, params.legendRoundTo);

			legend.selectAll('vis__legend__tips').data(steps).enter().append('text')
				.classed('vis__legend__tips', true)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format((i + 0.5) * params.legendSampleWidth + 10, 30 + params.legendSampleWidth);
				})
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'before-edge')
				.text(function(d) { return Math.round(d * multiplicator) / multiplicator; });
			
		}
		if (params.showLegend)
			drawLegend();*/
	}
}


function Bumpchart(svg, xValues, data, p) {
	var params = {
		leftMargin: 100,
		rightMargin: 100,
		topMargin: 20,
		graphWidth: 500,
		minColor: '#d73027',
		zeroColor: '#ccc',
		maxColor: '#1a9850',
		rotateYAxisTips: true,
		showLegend: true,
		legendSteps: 3,
		legendSampleWidth: 20,
		legendRoundTo: 0,
		showLeftAxis: true,
		showRightAxis: true,
		showBottomAxis: true,
		showPositions: 20,
		positionHeight: 15,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var graphHeight = params.showPositions * params.positionHeight;
	var maxChange = 0;

	var leftAxis,
		rightAxis,
		bottomAxis,
		graphArea,
		hintsArea,
		xScale,
		yScale,
		colorScale;

	var leftNames = [];
	var rightNames = [];

	var selectedItem;

	var zoom;


	function isPositionVisible(position) {
		var y = yScale(position);
		return (y >= 0 && y < graphHeight);
	}

	function drawAxes() {
		bottomAxis.call(d3.axisBottom(xScale).ticks(xValues.length)
			.tickFormat(function(d, i) { return xValues[d]; }));
		leftAxis.call(d3.axisLeft(yScale).ticks(params.showPositions)
			.tickFormat(function(d, i) {
				if (leftNames[d] !== undefined)
					return leftNames[d].name + ' - ' + d;
				else
					return '';
			}));
		rightAxis.call(d3.axisRight(yScale).ticks(params.showPositions)
			.tickFormat(function(d, i) {
				if (rightNames[d] !== undefined)
					return d + ' - ' + rightNames[d].name;
				else
					return '';
			}));

		
		function setTickColorAndHover(axis, names) {
			axis.selectAll('.tick')
				.on('mouseover', function(d, i) { showHints(names[d]); })
				.on('mouseout', function(d, i) { hideHints(); })
				.classed('selected', function(d) { return d !== undefined && names[d] !== undefined && names[d] == selectedItem; })
				.select('text')
					.attr('fill', function(d, i) {
						if (names[d] !== undefined) 
							return colorScale(names[d].change);
						else
							return colorScale(0);
					});
		}
		setTickColorAndHover(leftAxis, leftNames);
		setTickColorAndHover(rightAxis, rightNames);
	}

	// hints
	function showHints(line) {
		if (line === undefined)
			return;

		function setHint(hints) {
			hints.select('text').text(function(d, i) {
				if (d === undefined)
					return '';
				
				var isVisible = isPositionVisible(d.position);
				if ((i == 0 && !isVisible) || (i < 0 && line.values.indexOf(d) == 0)) // on the left axis or the first appearance
					return '{0} - {1}'.format(leftNames[d.position].name, d.position);
				if ((i == xValues.length - 1 && !isVisible) || (i == line.values.length -1 && i < xValues.length - 1)) // right axis or the last appearance
					return '{0} - {1}'.format(d.position, rightNames[d.position].name);
				else
					return d.position;
			});
			hints.attr('transform', function(d, i) {
				if (d === undefined)
					return '';

				var yPosition = yScale(d.position);
				if (yPosition < 0) yPosition = 0;
				else if (yPosition > graphHeight) yPosition = graphHeight;
				return 'translate({0},{1})'.format(xScale(i), yPosition);
			});

			hints.each(function(d) {
				var _this = d3.select(this);
				var bbox = _this.select('text').node().getBBox();
				_this.select('path')
					.attr('d', 'M0 0 L-5 -5 L-{0} -5 L-{0} -20 L{0} -20 L{0} -5 L5 -5 Z'.format(bbox.width / 2 + 5));
			})

			hints.attr('visibility', function(d, i) {
				if (d === undefined)
					return 'hidden';

				if ((i == 0 || i == xValues.length - 1) && isPositionVisible(d.position))
					return 'hidden';
				else
					return 'visible';
			});
		}

		var hints = hintsArea.selectAll('.vis__hints__hint').data(line.values);
		hints.call(setHint);

		hints.exit().remove();
		var newHints = hints.enter().append('g')
			.classed('vis__hints__hint', true)
			.attr('visibility', function(d) { return (d !== undefined) ? 'visible' : 'hidden'; });
		
		newHints.append('path');
		newHints.append('text')
			.attr('dy', -10)
			.attr('text-anchor', 'middle');

		newHints.call(setHint);

		// lines
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
	}

	// draw
	this.draw = function() {
		svg.attr('class', 'vis vis--bumpchart');

		function addClipRect() {
			svg.append('defs').append('clipPath').attr('id', 'graph-clip')
				.append('rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', params.graphWidth)
					.attr('height', graphHeight);
		}
		addClipRect();

		leftAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		rightAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin + params.graphWidth, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		bottomAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin + graphHeight))
			.classed('vis__axis vis__axis--bottom', true);

		graphArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__graph', true)
			.attr('clip-path', 'url(#graph-clip)');

		hintsArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__hints', true);

		xScale = d3.scaleLinear()
			.domain([0, xValues.length - 1])
			.range([0, params.graphWidth]);

		yScale = d3.scaleLinear()
			.domain([0.5, params.showPositions + 0.5])
			.range([0, graphHeight]);

		// hints

		

		// find names for the left and the right axes
		// calculate change for all lines and max change
		data.forEach(function(d) {
			if (d.values[0] !== undefined)
				leftNames[d.values[0].position] = d;
			if (d.values[xValues.length - 1] !== undefined)
				rightNames[d.values[xValues.length - 1].position] = d;

			d.change = d.values[Object.keys(d.values)[0]].position - d.values[d.values.length - 1].position;
			maxChange = Math.max(maxChange, Math.abs(d.change));
		});
		
		// color scale
		var colorSteps = [];
		for (var i = 0; i < params.legendSteps + 1; i++) {
			colorSteps.push(d3.interpolateRgb(params.minColor, params.zeroColor)(i / (params.legendSteps)));
		}
		for (var i = 1; i < params.legendSteps + 1; i++) {
			colorSteps.push(d3.interpolateRgb(params.zeroColor, params.maxColor)(i / (params.legendSteps)));
		}

		colorScale = d3.scaleQuantize()
			.domain([-maxChange, maxChange])
			.range(colorSteps);


		function drawData() {
			function positionLines(selection) {
				selection.selectAll('polyline').attr('points', function(line) {
					var res = '';
					line.values.forEach(function(x, i) {
						res += ' ' + xScale(i) + ' ' + yScale(x.position);
					});
					return res;
				});
			}

			var points = graphArea.selectAll('.vis__graph__line').data(data)
				.call(positionLines);

			var newLines = points.enter().append('g')
				.classed('vis__graph__line', true)
				.on('mouseover', showHints)
				.on('mouseout', hideHints);

			newLines.append('polyline')
				.classed('vis__graph__line__bg', true);
			newLines.append('polyline')
				.classed('vis__graph__line__line', true)
				.attr('stroke', function(d) { return colorScale(d.change); });
			newLines.call(positionLines);
		}


		function drawLegend() {
			var legend = svg.append('g')
				.classed('vis__legend', true)
				.attr('transform', 'translate({0},{1})'.format(params.graphWidth + params.leftMargin + params.rightMargin + 50, params.topMargin));

			var legendWidth = (2 * params.legendSteps + 1) * params.legendSampleWidth;
			legend.append('rect')
				.classed('vis__legend__bg', true)
				.attr('width', 20 + legendWidth)
				.attr('height', params.legendSampleWidth + 50);

			legend.append('text') // <-- FIX
				.attr('transform', 'translate({0},{1})'.format(10, 20))
				.text('Change in ranking');

			var steps = [];
			for (var i = -params.legendSteps; i <= params.legendSteps; i++)
				steps.push(maxChange / (params.legendSteps + 0.5) * i);

			legend.selectAll('vis__legend__sample').data(steps).enter().append('rect')
				.classed('vis__legend__sample', true)
				.attr('fill', function(d) { return colorScale(d); })
				.attr('width', 20)
				.attr('height', 20)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format(10 + i * 20, 30);
				});

			legend.selectAll('vis__legend__tips').data(steps).enter().append('text')
				.classed('vis__legend__tips', true)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format((i + 0.5) * 20 + 10, 30 + 20);
				})
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'before-edge')
				.text(function(d) { return Math.round(d); });
			

				// zoom behaviour
				
				zoom = d3.zoom()
					.scaleExtent([1, 1])
					.translateExtent([[0, 0], [svg.node().clientWidth, (data.length - params.showPositions) * params.positionHeight + svg.node().clientHeight]])
					.on('zoom', zoomed);

				

				function zoomed() {
					var transform = d3.zoomTransform(this);
					console.log(transform);
					var shift = -transform.y / params.positionHeight;
					yScale.domain([0.5 + shift, 0.5 + params.showPositions + shift]);

					drawAxes();
					drawData();
				}

				var t = d3.zoomIdentity.translate(0, 0).scale(1);
				svg.call(zoom.transform, t);
				svg.call(zoom);
		}
		if (params.showLegend)
			drawLegend();
	}

	this.select = function(item) {
		selectedItem = item;
		graphArea.selectAll('.vis__graph__line')
			.classed('selected', function(d) { return d == item; });
		drawAxes();

		var lastValue = item.values[item.values.length - 1];
		var t = d3.zoomTransform(svg.node());
		var shift = graphHeight / 2 - yScale(lastValue.position);
		if (t.y - shift < 0) shift = -t.y;

		svg.transition()
			.duration(500)
			.ease(d3.easeLinear)
			.call(zoom.transform, t.translate(0, shift));
	}
}


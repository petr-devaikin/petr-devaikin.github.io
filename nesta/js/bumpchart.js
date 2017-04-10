function Bumpchart(svg, xValues, data, p) {
	var params = {
		leftMargin: 100,
		rightMargin: 100,
		topMargin: 20,
		graphWidth: 500,
		minColor: '#d73027',
		zeroColor: '#bbb',
		maxColor: '#1a9850',
		rotateYAxisTips: true,
		showLeftAxis: true,
		showRightAxis: true,
		showBottomAxis: true,
		showPositions: 20,
		positionHeight: 15,
		onItemSelect: undefined,
		legendSteps: 5,
		overviewWidth: 100,
		maxOverviewPositionHeight: 5,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var graphHeight = params.showPositions * params.positionHeight;
	var overviewHeight = graphHeight;

	var leftAxis,
		rightAxis,
		bottomAxis,
		graphArea,
		overviewArea,
		hintsArea,
		xScale,
		yScale,
		colorScale;

	var leftNames = [];
	var rightNames = [];

	var selectedItem;
	var overviewViewport;

	var zoom;

	function drawAxes() {
		bottomAxis.call(d3.axisBottom(xScale).ticks(xValues.length)
			.tickFormat(function(d, i) { return xValues[d]; }));
		leftAxis.call(d3.axisLeft(yScale).ticks(params.showPositions)
			.tickFormat(function(d, i) {
				return leftNames[d] !== undefined ? leftNames[d].name + ' - ' + d : '';
			}));
		rightAxis.call(d3.axisRight(yScale).ticks(params.showPositions)
			.tickFormat(function(d, i) {
				return rightNames[d] !== undefined ? d + ' - ' + rightNames[d].name : '';
			}));
		
		function setTickColorAndHover(axis, names) {
			axis.selectAll('.tick')
				.on('mouseover', function(d, i) { showHints(names[d]); })
				.on('mouseout', function(d, i) { hideHints(); })
				.on('click', function(d) {
					d3.event.stopPropagation();
					selectItem(names[d]);
				})
				.attr('visibility', function(d) {
					return names[d] !== undefined ? 'visible' : 'hidden';
				})
				.select('text')
					.attr('fill', function(d, i) {
						return names[d] !== undefined ? colorScale(names[d].change) : colorScale(0);
					});
		}

		setTickColorAndHover(leftAxis, leftNames);
		setTickColorAndHover(rightAxis, rightNames);

		blurTicks(leftAxis, leftNames);
		blurTicks(rightAxis, rightNames);
	}

	function blurTicks(axis, names, line) {
		axis.selectAll('.tick')
			.classed('blured', function(d) {
				if (d === undefined || names[d] === undefined)
					return false;

				if (line !== undefined) { // item hovered
					if (selectedItem !== undefined)
						return names[d] != line && names[d] != selectedItem;
					else
						return names[d] != line;
				}
				else { // item not hovered
					if (selectedItem === undefined)
						return false;
					else
						return names[d] != selectedItem;
				}
			})
	}

	// hints
	function showHints(line) {
		if (line === undefined)
			return;

		function setHint(hints) {
			function isPositionVisible(position) {
				var y = yScale(position);
				return (y >= 0 && y < graphHeight);
			}

			hints.select('text').text(function(d, i) {
				if (d === undefined)
					return '';
				
				var isVisible = isPositionVisible(d.position);
				if ((i == 0 && !isVisible) || (i < 0 && line.values.indexOf(d) == 0)) // on the left axis or the first appearance
					return '{0} - {1}'.format(leftNames[d.position].name, d.value);
				if ((i == xValues.length - 1 && !isVisible) || (i == line.values.length -1 && i < xValues.length - 1)) // right axis or the last appearance
					return '{0} - {1}'.format(d.value, rightNames[d.position].name);
				else
					return d.value;
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
				return 'visible';
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
			.classed('blured', function(d) { return d != line && d != selectedItem; });

		// overview lines
		overviewArea.selectAll('.vis__overview__line')
			.classed('blured', function(d) { return d != line && d != selectedItem; })

		blurTicks(leftAxis, leftNames, line);
		blurTicks(rightAxis, rightNames, line);
	}

	function hideHints() {
		hintsArea.selectAll('.vis__hints__hint').attr('visibility', 'hidden');
		graphArea.selectAll('.vis__graph__line').classed('blured', function(d) {
			return d != selectedItem && selectedItem !== undefined;
		});
		overviewArea.selectAll('.vis__overview__line').classed('blured', function(d) {
			return d != selectedItem && selectedItem !== undefined;
		});

		blurTicks(leftAxis, leftNames);
		blurTicks(rightAxis, rightNames);
	}

	function init() {
		// Clean canvas
		svg.html('');
		svg.attr('class', 'vis vis--bumpchart');

		// Add clipping rect
		svg.append('defs').append('clipPath').attr('id', 'graph-clip')
			.append('rect')
				.attr('x', 0).attr('y', 0)
				.attr('width', params.graphWidth).attr('height', graphHeight);

		// Add axes
		leftAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		rightAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin + params.graphWidth, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		bottomAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin + graphHeight))
			.classed('vis__axis vis__axis--bottom', true);

		// Add graph, overview and hints areas
		graphArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__graph', true)
			.attr('clip-path', 'url(#graph-clip)');

		hintsArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__hints', true);

		overviewArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin + params.rightMargin + params.graphWidth + 20, params.topMargin))
			.classed('vis__overview', true);

		// Process data

		// find names for the left and the right axes
		// calculate change for all lines and max change
		var maxChange = 0;
		data.forEach(function(d) {
			if (d.values[0] !== undefined)
				leftNames[d.values[0].position] = d;
			if (d.values[xValues.length - 1] !== undefined)
				rightNames[d.values[xValues.length - 1].position] = d;

			maxChange = Math.max(maxChange, Math.abs(d.change));
		});
	
		// Init scales
		xScale = d3.scaleLinear()
			.domain([0, xValues.length - 1])
			.range([0, params.graphWidth]);

		yScale = d3.scaleLinear()
			.domain([0.5, params.showPositions + 0.5])
			.range([0, graphHeight]);

		colorScale = ColorPalette.discreteDouble(maxChange, params.legendSteps).scale;

		// Zoom behaviour
		var maxYPosition =
			data.length > params.showPositions ? 
			(data.length - params.showPositions) * params.positionHeight + svg.node().clientHeight :
			svg.node().clientHeight;
		zoom = d3.zoom()
			.scaleExtent([1, 1])
			.translateExtent([[0, 0], [svg.node().clientWidth, maxYPosition]])
			.on('zoom', zoomed);

		function zoomed() {
			var transform = d3.zoomTransform(this);
			
			var shift = -transform.y / params.positionHeight;
			yScale.domain([0.5 + shift, 0.5 + params.showPositions + shift]);

			updateOverviewViewport(transform);

			drawAxes();
			drawData();
		}

		// Clear selection on click
		svg.on("click", function() {
			console.log('reset selection');
			selectItem();
		});
	}
	init();

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

		var lines = graphArea.selectAll('.vis__graph__line').data(data)
			.call(positionLines);

		var newLines = lines.enter().append('g')
			.classed('vis__graph__line', true)
			.on('mouseover', showHints)
			.on('mouseout', hideHints)
			.on('click', function(d) {
				d3.event.stopPropagation();
				selectItem(d);
			});

		newLines.append('polyline')
			.classed('vis__graph__line__bg', true);
		newLines.append('polyline')
			.classed('vis__graph__line__line', true)
			.attr('stroke', function(d) { return colorScale(d.change); });
		newLines.call(positionLines);
	}

	// Overview

	function drawOverview() {
		overviewArea.append('rect')
			.classed('vis__overview__bg', true)
			.attr('width', params.overviewWidth)
			.attr('height', overviewHeight);

		overviewArea.append('text')
			.classed('vis__overview__title', true)
			.attr('transform', 'translate({0},{1})'.format(params.overviewWidth / 2, -7))
			.text('Overview');

		var linesNumber = Math.max(data.length, params.showPositions);

		var overviewXScale = d3.scaleLinear().domain([0, xValues.length - 1]).range([0, params.overviewWidth]);
		var overviewYScale = d3.scaleLinear().domain([0.5, linesNumber + 0.5]).range([0, overviewHeight]);

		overviewArea.selectAll('.vis__overview__line').data(data).enter().append('polyline')
			.classed('vis__overview__line', true)
			.attr('points', function(line) {
				var res = '';
				line.values.forEach(function(x, i) {
					res += ' ' + overviewXScale(i) + ' ' + overviewYScale(x.position);
				});
				return res;
			})
			.attr('stroke', function(d) { return colorScale(d.change); });

		overviewViewport = overviewArea.append('rect')
			.classed('vis__overview__viewport', true)
			.attr('width', params.overviewWidth)
			.attr('height', overviewHeight * params.showPositions / linesNumber);

		var dragStartY = 0;
		var dragStartTransformY = 0;
		var drag = d3.drag()
			.on('start', function() {
				dragStartY = d3.event.y;
				var t = d3.zoomTransform(svg.node());
				dragStartTransformY = t.y;
			})
			.on('drag', function() {
				var shift = (dragStartY - d3.event.y) * linesNumber * params.positionHeight / overviewHeight;
				var newY = dragStartTransformY + shift;
				if (newY > 0) newY = 0;
				if (newY < -linesNumber * params.positionHeight + graphHeight) newY = -linesNumber * params.positionHeight + graphHeight;
				svg.call(zoom.transform, d3.zoomIdentity.translate(0, newY));
				//console.log(d3.event.y, shift, newY);
			});

		overviewViewport.call(drag);
		overviewViewport.on('click', function() {
			d3.event.stopPropagation();
		})
	}

	function updateOverviewViewport(transform) {
		var t = d3.zoomTransform(svg.node()); // FIX ?
		var linesNumber = Math.max(data.length, params.showPositions);
		var shift = - transform.y * overviewHeight / (linesNumber * params.positionHeight);
		overviewViewport.attr('transform', 'translate({0},{1})'.format(0, shift));
	}

	// draw
	this.draw = function() {
		drawOverview();

		// FIX! wrong place
		var t = d3.zoomIdentity.translate(0, 0);
		svg.call(zoom.transform, t);
		svg.call(zoom);

		drawData();
	}

	// select line logic
	function selectItem(item, fromOutside) {
		selectedItem = item;

		if (fromOutside === undefined && params.onItemSelect !== undefined)
			params.onItemSelect(item);

		graphArea.selectAll('.vis__graph__line')
			.classed('selected', function(d) { return d == item; })
			.classed('blured', function(d) { return item !== undefined && d != item; });

		overviewArea.selectAll('.vis__overview__line')
			.classed('selected', function(d) { return d == item; })
			.classed('blured', function(d) { return item !== undefined && d != item; });

		blurTicks(leftAxis, leftNames);
		blurTicks(rightAxis, rightNames);

		if (item !== undefined) {
			var lastValue = item.values[item.values.length - 1];
			var t = d3.zoomTransform(svg.node());

			if (data.length > params.showPositions) {
				var shift;
				if (lastValue.position <= params.showPositions / 2)
					shift = - t.y;
				else if (lastValue.position >= data.length - params.showPositions / 2) {
					shift = - params.positionHeight * data.length + graphHeight - t.y;
				}
				else
					shift = graphHeight / 2 - yScale(lastValue.position);

				svg.transition()
					.duration(500)
					.ease(d3.easeLinear)
					.call(zoom.transform, t.translate(0, shift));
			}
		}
	}

	this.select = function(item) {
		selectItem(item, true);
	}
}


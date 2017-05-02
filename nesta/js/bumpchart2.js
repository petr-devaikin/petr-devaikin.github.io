function Bumpchart(svg, xValues, data, p) {
	var params = {
		leftMargin: 100,
		rightMargin: 100,
		topMargin: 20,
		graphWidth: 500,
		showPositions: 20,
		positionHeight: 15,
		lineMinHeight: 2,
		lineMaxHeight: 10,
		minSecondValue: 0,
		onItemSelect: undefined,
		legendSteps: 5,
		overviewWidth: 100,
		maxOverviewPositionHeight: 5,
		showOverview: true,
		addHint: undefined,
		setHintContent: undefined,
		categories: [],
		showGrid: true,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var width, height;

	var graphHeight = params.showPositions * params.positionHeight;
	var overviewHeight = graphHeight;

	var lines;

	var leftAxis,
		rightAxis,
		bottomAxis,
		graphArea,
		overviewArea,
		hintsArea,
		xScale,
		yScale,
		colorScale,
		thicknessScale;

	var leftTicksMeta = {};
	var rightTicksMeta = {};

	var selectedItem;
	var overviewViewport;

	var zoom;

	// INIT
	function init() {
		width = svg.node().getBoundingClientRect().width;
		height = svg.node().getBoundingClientRect().height;

		// Clean canvas
		svg.html('').attr('class', 'vis vis--bumpchart');

		// Add clipping rect
		var defs = svg.append('defs');
		defs.append('clipPath').attr('id', 'graph-clip')
			.append('rect')
				.attr('width', params.graphWidth).attr('height', graphHeight);

		// Add graph, overview
		graphArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__graph', true)
			.attr('clip-path', 'url(#graph-clip)');

		overviewArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin + params.rightMargin + params.graphWidth + 20, params.topMargin))
			.classed('vis__overview', true);

		// Add axes
		leftAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		rightAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin + params.graphWidth, params.topMargin))
			.classed('vis__axis vis__axis--right', true);

		bottomAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin + graphHeight))
			.classed('vis__axis vis__axis--bottom', true);

		// hints ares

		hintsArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__hints', true);

		// Process data
		maxSecondValue = 0;

		function processData() {
			// calculate rank
			for (var i = xValues.length - 1; i >= 0; i--) {
				var x = xValues[i];
				var xData = data.filter(function(d) { return d.x == x; });
				xData.sort(function(a, b) {
					if (b.value == a.value && i < xValues.length - 1) {
						var aNextValue = data.find(function(d) { return d.x == xValues[i + 1] && d.name == a.name; });
						var bNextValue = data.find(function(d) { return d.x == xValues[i + 1] && d.name == b.name; });
						return aNextValue.position - bNextValue.position;
					}
					else
						return b.value - a.value;
				});
				xData.forEach(function(d, i) { d.position = i + 1; });
			}

			// group lines
			lineData = {};

			data.forEach(function(d) {
				if (lineData[d.name] === undefined) lineData[d.name] = { name: d.name, category: d.category, values: [] };
				lineData[d.name].values.push(d);

				// calc max second value
				maxSecondValue = Math.max(maxSecondValue, d.secondValue);
			});

			lineData = Object.keys(lineData).map(function(d) { return lineData[d]; });

			// prepare meta data
			lineData.forEach(function(d) {
				leftTicksMeta[d.values[0].position] = {
					line: d,
					value: d.values[0]
				};
				rightTicksMeta[d.values[xValues.length - 1].position] = {
					line: d,
					value: d.values[xValues.length - 1]
				}
			});

			// sort values in each line
			lineData.forEach(function(l) {
				l.values.sort(function(a, b) { return xValues.indexOf(a.x) - xValues.indexOf(b.x); });
			});
		}
		processData();

	
		// Init scales
		xScale = d3.scaleLinear()
			.domain([0, xValues.length - 1])
			.range([0, params.graphWidth]);

		yScale = d3.scaleLinear()
			.domain([0.5, params.showPositions + 0.5])
			.range([0, graphHeight]);

		colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(params.categories);
		thicknessScale = d3.scaleLinear()
			.domain([params.minSecondValue, maxSecondValue])
			.range([params.lineMinHeight, params.lineMaxHeight]);


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

			if (params.showOverview)
				updateOverviewViewport(transform);

			drawAxes();
			drawData();
		}
	}
	init();


	// DRAWING

	function blurTicks(axis, meta, line) {
		axis.selectAll('.tick')
			.classed('blured', function(d) {
				if (d === undefined || meta[d] === undefined)
					return false;

				if (line !== undefined) { // item hovered
					if (selectedItem !== undefined)
						return meta[d].line != line && meta[d].line != selectedItem;
					else
						return meta[d].line != line;
				}
				else { // item not hovered
					if (selectedItem === undefined)
						return false;
					else
						return meta[d].line != selectedItem;
				}
			});
	}

	function drawAxes() {
		bottomAxis.call(d3.axisBottom(xScale).ticks(xValues.length).tickFormat(function(d, i) { return xValues[d]; }));
		leftAxis.call(d3.axisLeft(yScale).ticks(params.showPositions)
			.tickFormat(function(d, i) {
				return leftTicksMeta[d] !== undefined ? leftTicksMeta[d].line.name : '';
			})
			.tickSize(0));
		rightAxis.call(d3.axisRight(yScale).ticks(params.showPositions)
			.tickFormat(function(d, i) {
				return rightTicksMeta[d] !== undefined ? rightTicksMeta[d].line.name : '';
			})
			.tickSize(0));
		
		function setTickColorAndHover(axis, ticksMeta) {
			axis.selectAll('.tick')
				.on('mouseover', function(d, i) { showHints(ticksMeta[d].line); })
				.on('mouseout', function(d, i) { hideHints(); })
				/*.on('click', function(d) {
					d3.event.stopPropagation();
					selectItem(ticksMeta[d].line);
				})*/
				.attr('visibility', function(d) { return ticksMeta[d] !== undefined ? 'visible' : 'hidden'; })
				.select('text')
					.attr('fill', function(d) {
						return ticksMeta[d] !== undefined ? colorScale(ticksMeta[d].line.category) : null;
					});
		}

		setTickColorAndHover(leftAxis, leftTicksMeta);
		setTickColorAndHover(rightAxis, rightTicksMeta);

		blurTicks(leftAxis, leftTicksMeta);
		blurTicks(rightAxis, rightTicksMeta);
	}

	function drawData() {
		var line = d3.line().curve(d3.curveMonotoneX);

		function positionLines(selection) { selection.selectAll('path').attr('d', line); }

		function getLinePointsFromValues(d) {
			var points = [];

			var i = d.values.length - 1;
			points.unshift([
				xScale(i) + 5,
				yScale(d.values[i].position) - thicknessScale(d.values[i].secondValue) / 2
			]);
			points.push([
				xScale(i) + 5,
				yScale(d.values[i].position) + thicknessScale(d.values[i].secondValue) / 2
			]);

			for (var i = d.values.length - 1; i >= 0; i--) {
				points.unshift([
					xScale(i),
					yScale(d.values[i].position) - thicknessScale(d.values[i].secondValue) / 2 + 0.1 * (i % 2)
				]);
				points.push([
					xScale(i),
					yScale(d.values[i].position) + thicknessScale(d.values[i].secondValue) / 2 + 0.1 * (i % 2)
				]);
			}

			i = 0;
			points.unshift([
				xScale(i) - 5,
				yScale(d.values[i].position) - thicknessScale(d.values[i].secondValue) / 2
			]);
			points.push([
				xScale(i) - 5,
				yScale(d.values[i].position) + thicknessScale(d.values[i].secondValue) / 2
			]);
			return points;
		}

		var lines = graphArea.selectAll('.vis__graph__line').data(lineData)
			.call(positionLines);

		var newLines = lines.enter().append('g')
			.classed('vis__graph__line', true)
			.on('mouseover', showHints)
			.on('mouseout', hideHints)
			/*.on('click', function(d) {
				d3.event.stopPropagation();
				selectItem(d);
			})*/;

		newLines.append('path')
			.classed('vis__graph__line__bg', true)
			.datum(getLinePointsFromValues);
		newLines.append('path')
			.classed('vis__graph__line__line', true)
			.attr('fill', function(d, i) { return colorScale(d.category); })
			.datum(getLinePointsFromValues)
		newLines
			.call(positionLines);
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

		var line = d3.line()
			.x(function(d, i) { return overviewXScale(i); })
			.y(function(d) { return overviewYScale(d.position); })
			.curve(d3.curveMonotoneX);

		var overviewLines = overviewArea.selectAll('.vis__overview__line').data(lines).enter().append('g')
			.classed('vis__overview__line', true);

		overviewLines.append('path')
			.attr('stroke', function(d, i) { return 'url(#grad{0})'.format(i); })
			.datum(function(d) { return d.values; })
			.attr('d', line);

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
		overviewArea.on('click', function() {
			d3.event.stopPropagation();
		})
	}

	function updateOverviewViewport(transform) {
		var t = d3.zoomTransform(svg.node()); // FIX ?
		var linesNumber = Math.max(data.length, params.showPositions);
		var shift = - transform.y * overviewHeight / (linesNumber * params.positionHeight);
		overviewViewport.attr('transform', 'translate({0},{1})'.format(0, shift));
	}

	// API

	this.select = function(item) {
		selectItem(item, true);
	}

	this.overLine = function(lineName) {
		if (lineName !== undefined)
			showHints(lineData.find(function(d) { return d.name == lineName; }));
		else
			hideHints();
	}

	this.draw = function() {
		if (params.showOverview)
			drawOverview();

		// FIX! wrong place
		var t = d3.zoomIdentity.translate(0, 0);
		svg.call(zoom.transform, t);
		svg.call(zoom);

		//drawData();
	}

	this.getParams = function() { return params; };

	this.getMinSecondValue = function() { return params.minSecondValue; };
	this.getMaxSecondValue = function() { return maxSecondValue; };


	// INTERACTION

	// hints
	function showHints(line) {
		if (line === undefined)
			return;

		function setHintPositionAndContent(hints) {
			function isPositionVisible(position) {
				var y = yScale(position);
				return (y >= 0 && y < graphHeight);
			}

			hints.each(function(d, i) {
				var _this = d3.select(this);
				_this.select('.vis__hints__hint__bg').attr('d', '');

				var isVisible = isPositionVisible(d.position);

				if (params.setHintContent !== undefined)
					params.setHintContent(d3.select(this), line, d, i == 0, xValues.length - 1, isVisible);

				// set bg
				var bbox = _this.node().getBBox();
				_this.select('.vis__hints__hint__bg')
					.attr('d', 'M{0} {1} L{2} {3} L{4} {3} L {4} {5} L{6} {5} L{6} {3} L{7} {3} Z'.format(
						bbox.x + bbox.width / 2, bbox.y + bbox.height + 5,
						bbox.x + bbox.width / 2 - 4, bbox.y + bbox.height + 1,
						bbox.x - 3, bbox.y - 1,
						bbox.x + bbox.width + 3, bbox.x + bbox.width / 2 + 4
					));

				// set position
				_this.attr('transform', function(d) {
					var yPosition = yScale(d.position);
					if (yPosition < 0) yPosition = 0;
					else if (yPosition > graphHeight) yPosition = graphHeight;
					return 'translate({0},{1})'.format(xScale(i) - bbox.x - bbox.width / 2, yPosition - bbox.y - bbox.height - 7);
				})
			})

			hints.attr('visibility', 'visible');
		}

		var hints = hintsArea.selectAll('.vis__hints__hint').data(line.values);
		hints.call(setHintPositionAndContent);

		hints.exit().remove();
		var newHints = hints.enter().append('g')
			.classed('vis__hints__hint', true);
		
		newHints.append('path').classed('vis__hints__hint__bg', true);
		if (params.addHint !== undefined)
			newHints.each(function(d) { params.addHint(d3.select(this), d); });

		newHints.call(setHintPositionAndContent);


		// lines
		graphArea.selectAll('.vis__graph__line')
			.classed('blured', function(d) { return d != line && d != selectedItem; });

		// overview lines
		overviewArea.selectAll('.vis__overview__line')
			.classed('blured', function(d) { return d != line && d != selectedItem; })

		blurTicks(leftAxis, leftTicksMeta, line);
		blurTicks(rightAxis, rightTicksMeta, line);
	}

	function hideHints() {
		hintsArea.selectAll('.vis__hints__hint').attr('visibility', 'hidden');
		graphArea.selectAll('.vis__graph__line').classed('blured', function(d) {
			return d != selectedItem && selectedItem !== undefined;
		});
		overviewArea.selectAll('.vis__overview__line').classed('blured', function(d) {
			return d != selectedItem && selectedItem !== undefined;
		});

		blurTicks(leftAxis, leftTicksMeta);
		blurTicks(rightAxis, rightTicksMeta);
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

		blurTicks(leftAxis, leftTicksMeta);
		blurTicks(rightAxis, rightTicksMeta);

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

	// Clear selection on click
	/*
	svg.on("click", function() {
		console.log('reset selection');
		selectItem();
	});
	*/
}


function Barchart(svg, years, sectors, data, p) {
	var params = {
		leftMargin: 100,
		topMargin: 100,
		graphWidth: 500,
		graphHeight: 300,
		barWidth: 40,
		sectorColors: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3']
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	this.draw = function(xFilter, xFilterName, yFilter, yFilterName, year) {
		console.log(xFilter, yFilter, year);

		svg.classed('vis--barchart', true);
		svg.html('');

		var graphArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__graph', true);

		var leftAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__axis vis__axis--left', true);

		var bottomAxis = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin + params.graphHeight))
			.classed('vis__axis vis__axis--bottom', true);

		var hintsArea = svg.append('g')
			.attr('transform', 'translate({0},{1})'.format(params.leftMargin, params.topMargin))
			.classed('vis__hints', true);

		// prepare data
		var bars = {}
		var maxYValue = 0;

		data.forEach(function(d) {
			var x = d[xFilter];

			if (bars[x] === undefined) {
				bars[x] = {};
				sectors.forEach(function(s) {
					bars[x][s] = 0;
				})
			}

			if (d.year == year)
				bars[x][d.sector] += d[yFilter];
		});

		bars = Object.keys(bars).map(function(x) {
			var shift = 0;
			var res = {
				x: parseInt(x),
				sectors: sectors.map(function(sector) {
					var res = {
						sector: sector,
						value: bars[x][sector],
						shift: shift
					}
					shift += bars[x][sector];
					return res;
				}),
				sum: shift
			}
			maxYValue = Math.max(maxYValue, res.sum);
			return res;
		});

		// scales
		var xScale = d3.scaleLinear()
			.domain([0, 10])
			.range([0, params.graphWidth]);

		var yScale = d3.scaleLinear()
			.domain([0, maxYValue])
			.range([params.graphHeight, 0]);

		var colorScale = d3.scaleOrdinal()
			.domain(sectors)
			.range(params.sectorColors);

		// axes
		function drawAxes() {
			bottomAxis.call(d3.axisBottom(xScale)
				.ticks(10)
				.tickFormat(function(d, i) { return d * 10; })
			);
			leftAxis.call(d3.axisLeft(yScale));

			bottomAxis.append('text').classed('vis__axis__label', true)
				.attr('transform', 'translate({0},{1})'.format(params.graphWidth / 2, 40))
				.text(xFilterName);
			leftAxis.append('text').classed('vis__axis__label', true)
				.attr('transform', 'translate({0},{1}) rotate({2})'.format(-70, params.graphHeight / 2, -90))
				.text(yFilterName);
		}
		drawAxes();

		// data
		function drawData() {
			function drawBars(bars) {
				function setSection(selection) {
					selection
						.attr('x', -params.barWidth / 2)
						.attr('y', function(d) { return yScale(d.shift + d.value); })
						.attr('width', params.barWidth)
						.attr('height', function(d) { return yScale(d.shift) - yScale(d.shift + d.value); })
						.attr('fill', function(d) { return colorScale(d.sector); })
				}

				var sections = bars.selectAll('.vis__graph__bar__section').data(function(d) { return d.sectors; })
					.call(setSection);
				sections.enter().append('rect')
					.classed('vis__graph__bar__section', true)
					.call(setSection);
			}

			graphArea.selectAll('.vis__graph__bar').data(bars).enter().append('g')
				.classed('vis__graph__bar', true)
				.attr('transform', function(d) {
					return 'translate({0},{1})'.format(xScale(d.x + 0.5), 0);
				})
				.on('mouseover', showHint)
				.on('mouseout', hideHint);

			drawBars(graphArea.selectAll('.vis__graph__bar'));
		}
		drawData();

		// hints
		var hint;
		function addHint() {
			hint = hintsArea.append('g').classed('vis__hints__hint', true);
			hint.append('rect');
			hint.append('text').classed('vis__hints__hint__sum', true)
				.attr('dy', 0);
			hint.selectAll('.vis__hints__hint__sector').data(sectors).enter().append('text')
				.classed('vis__hints__hint__sector', true)
				.attr('dy', function(d, i) { return 12 * (sectors.length - i); });
			hint.attr('visibility', 'hidden');
		}
		addHint();

		function showHint(bar) {
			hint.select('rect').attr('x', 0).attr('y', 0).attr('width', 0).attr('height', 0);

			hint.select('.vis__hints__hint__sum').text('Sum: ' + bar.sum.separate());
			hint.selectAll('.vis__hints__hint__sector').data(bar.sectors)
				.text(function(d) { return '{0}: {1}'.format(d.sector, d.value.separate()); });

			var bbox = hint.node().getBBox();

			hint.select('rect').attr('x', -5).attr('y', -5).attr('width', bbox.width + 10).attr('height', bbox.height + 10);

			hint.attr('transform', 'translate({0},{1})'.format(xScale(bar.x + 0.5) - bbox.width / 2, yScale(bar.sum) - 70));
			hint.attr('visibility', 'visible');
		}

		function hideHint() {
			hint.attr('visibility', 'hidden');
		}

		// legend
		function drawLegend() {
			var legend = d3.select('.legend');
			var reversedSectors = sectors.slice().reverse();

			// Add years!

			legend.selectAll('.sector').data(reversedSectors)
				.enter().append('div')
					.classed('sector', true)
					.style('border-left-color', function(d) { return colorScale(d); })
					.text(function(d) { return d; });
		}
		drawLegend();
	}
}
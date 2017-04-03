function Stacked(svg, datasets, p) {
	var params = {
		leftMargin: 100,
		topMargin: 20,
		graphWidth: 500,
		graphHeight: 300,
		sectorColors: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99']
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	this.draw = function(datasetName) {
		var years = datasets[datasetName].years;
		var sectors = datasets[datasetName].sectors;

		svg.classed('vis--stacked', true);
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
		var currentShift = {};
		var maxYValue = 0;

		var sectorsArray = [];

		Object.keys(sectors).forEach(function(s) {
			var data = [];

			var data = Object.keys(sectors[s].combined).map(function(y) {
				if (currentShift[y] === undefined) currentShift[y] = 0;
				var res = {
					year: y,
					value: sectors[s].combined[y],
					shift: currentShift[y],
				}
				currentShift[y] += sectors[s].combined[y];
				maxYValue = Math.max(currentShift[y], maxYValue);

				return res;
			});

			sectorsArray.push({
				name: s,
				data: data,
			});
		});

		// scales
		var xScale = d3.scaleLinear()
			.domain(d3.extent(years))
			.range([0, params.graphWidth]);

		var yScale = d3.scaleLinear()
			.domain([0, maxYValue])
			.range([params.graphHeight, 0]);

		var colorScale = d3.scaleOrdinal()
			.range(params.sectorColors);

		// axes
		function drawAxes() {
			bottomAxis.call(d3.axisBottom(xScale).ticks(years.length, 'i'));
			leftAxis.call(d3.axisLeft(yScale));
		}
		drawAxes();

		// data
		function drawData() {
			function drawStripe(stripe) {
				var points = [];
				stripe.data.forEach(function(d, i) {
					points[i] = { x: xScale(d.year), y: yScale(d.shift) };
					points[stripe.data.length * 2 - i - 1] = { x: xScale(d.year), y: yScale(d.shift + d.value)};
				});

				var lineFunction = d3.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; });

				d3.select(this).append('path')
					.attr('d', lineFunction(points));
			}

			var stripes = graphArea.selectAll('.vis__graph__stripe').data(sectorsArray).enter().append('g')
				.classed('vis__graph__stripe', true)
				.attr('fill', function(d, i) { return colorScale(i); })
				.on('mouseover', drawHints)
				.on('mouseout', hideHints);

			stripes.each(drawStripe);
		}
		drawData();

		// hints
		function drawHints(sector) {
			function setHints(selection) {
				selection
					.attr('transform', function(d) {
						return 'translate({0},{1})'.format(xScale(d.year), yScale(d.shift + d.value));
					})
					.attr('visibility', 'visible')
					.select('text')
						.text(function(d) { return d.value.separate(); });
			}

			var hints = hintsArea.selectAll('.vis__hints__hint').data(sector.data);
			var newHints = hints.enter().append('g')
				.classed('vis__hints__hint', true);
			newHints.append('text');

			hints.exit().remove();

			hints.call(setHints);
			newHints.call(setHints);
		}

		function hideHints() {
			hintsArea.selectAll('.vis__hints__hint').attr('visibility', 'hidden');
		}

		// legend
		function drawLegend() {
			var legend = d3.select('.legend');
			var reversedSectors = sectorsArray.slice().reverse();

			legend.selectAll('.sector').data(reversedSectors)
				.on('mouseover', drawHints)
				.on('mouseout', hideHints)
				.enter().append('div')
					.classed('sector', true)
					.style('border-left-color', function(d, i) { return colorScale(sectorsArray.length - i - 1); }) // FIX THIS!
					.text(function(d) { return d.name; })
					.on('mouseover', drawHints)
					.on('mouseout', hideHints);
		}
		drawLegend();
	}
}
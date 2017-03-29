var width = 1100,
	height = 600;

var newColor = 'blue';

d3.select('.m-filters__cities').on('change', function() {
	svg.selectAll('.cluster__bg').style('visibility', this.checked ? 'hidden': 'visible' );
})

d3.selectAll('.m-filters__range').on('change', function() {
	startYear = this.value;
	draw();
})

var startYear = '2009';

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height + 100);



var datareader = new Datareader();
function draw() {
	svg.html('').classed('vis--treemap', true);

	svg.append('pattern')
		.attr('id', 'diagonalHatch')
		.attr('patternUnits', 'userSpaceOnUse')
		.attr('width', 4)
		.attr('height', 4)
		.append('path')
			.attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
			.style('stroke', '#1a9850')
			.style('stroke-width', 1);

	datareader.readData(Datareader.DATASETS.BigSectorYearWelsh, function(cities, sectors, years) {
		var params = {
			legendSteps: 4,
			minColor: '#d73027',
			zeroColor: '#eee',
			maxColor: '#1a9850'
		}

		var treemap = d3.treemap()
			.tile(d3.treemapSquarify)
			.size([width - 250, height])
			.round(true)
			.padding(1)
			.paddingInner(1);

		var maxChange = 0;

		var stopYear = '2014';

		var processedData = {
			name: 'Industries',
			children: sectors.map(function(sector) {
				var sectorFirstValue = Object.keys(cities).reduce(function(a, k) { return a + cities[k][sector][startYear]; }, 0);
				var sectorFinalValue = Object.keys(cities).reduce(function(a, k) { return a + cities[k][sector][stopYear]; }, 0);
				var sectorChange = (sectorFinalValue - sectorFirstValue) / sectorFirstValue;
				maxChange = Math.max(maxChange, Math.abs(sectorChange));
				return {
					name: sector,
					change: sectorChange,
					value: sectorFinalValue,
					valueOld: sectorFirstValue,
					children: Object.keys(cities).map(function(k) {
						var city = cities[k];
						var change = undefined;
						if (city[sector][startYear] != 0) {
							change = (city[sector][stopYear] - city[sector][startYear]) / city[sector][startYear];
							maxChange = Math.max(maxChange, Math.abs(change));
						}
						return {
							name: k,
							size: city[sector][stopYear],
							value: city[sector][stopYear],
							valueOld: city[sector][startYear],
							change: change
						}
					})
				}
			})
		}

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


		var root = d3.hierarchy(processedData)
			.sum(sumBySize)
			.sort(function(a, b) { return b.height - a.height || b.value - a.value; });

		treemap(root);
		
		function sumBySize(d) {
			return d.size;
		}

		var cell = svg.selectAll(".leaf")
			.data(root.leaves())
			.enter().append("g")
			.classed('leaf', true)
			.attr("transform", function(d) { return "translate({0},{1})".format(d.x0, d.y0); });

		cell.append("rect")
			.attr("id", function(d) { return d.data.id; })
			.attr("width", function(d) { return d.x1 - d.x0; })
			.attr("height", function(d) { return d.y1 - d.y0; })
			.attr("fill", function(d) {
				if (d.data.change !== undefined)
					return colorScale(d.data.change);
				else
					return 'url(#diagonalHatch)';
			});

		var clusters = svg.selectAll('.cluster')
			.data(root.descendants().filter(function(d) { return d.depth == 1; }))
			.enter().append('g')
			.classed('cluster', true)
			.attr("transform", function(d) { return "translate({0},{1})".format(d.x0, d.y0); });


		clusters.append('rect')
			.classed('cluster__bg', true)
			.attr('x', 0)
			.attr('y', 0)
			.style('visibility', d3.select('.m-filters__cities').node().checked ? 'hidden' : 'visible')
			.attr('fill', function(d) { return colorScale(d.data.change); })
			.attr('width', function(d) { return d.x1 - d.x0; })
			.attr('height', function(d) { return d.y1 - d.y0; });

		clusters.append('rect')
			.classed('cluster__border', true)
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', function(d) { return d.x1 - d.x0; })
			.attr('height', function(d) { return d.y1 - d.y0; });

		var clusterTexts = clusters.append('text')
			.attr('dx', 5)
			.attr('dy', 5)
			.text(function(d) { return d.data.name; });

		var texts = cell.append("text")
			.attr('dx', function(d) { return (d.x1 - d.x0) / 2; })
			.attr('dy', function(d) { return (d.y1 - d.y0) / 2; })
			.text(function(d) { return d.data.name});

		texts.attr('visibility', function(d) {
			var leafTextBBox = this.getBBox();
			leafTextBBox.x += d.x0;
			leafTextBBox.y += d.y0;

			if (leafTextBBox.width > d.x1 - d.x0) return 'hidden';
			
			var overlap = false;
			clusterTexts.each(function(c) {
				var clusterTextBBox = this.getBBox();
				clusterTextBBox.x += c.x0;
				clusterTextBBox.y += c.y0;

				if (leafTextBBox.x < clusterTextBBox.x + clusterTextBBox.width &&
						leafTextBBox.x + leafTextBBox.width > clusterTextBBox.x &&
						leafTextBBox.y < clusterTextBBox.y + clusterTextBBox.height &&
						leafTextBBox.y + leafTextBBox.height > clusterTextBBox.y) {
					overlap = true;
				}
			});
			return !overlap ? 'visible' : 'hidden';
		})
			 /*
			.selectAll("tspan")
				.data(function(d) { console.log(d.data.name); return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
					.enter().append("tspan")
						.attr("x", 4)
						.attr("y", function(d, i) { return 13 + i * 10; })
						.text(function(d) { return d; }); */

		function drawLegend() {
			var legend = svg.append('g')
				.classed('vis__legend', true)
				.attr('transform', 'translate({0},{1})'.format(width - 200, 0));

			var legendWidth = (params.legendSteps * 2 + 1) * 20;
			legend.append('rect')
				.classed('vis__legend__bg', true)
				.attr('width', 20 + legendWidth)
				.attr('height', 110);

			legend.append('text') // <-- FIX
				.attr('transform', 'translate({0},{1})'.format(10, 20))
				.text('Change in value (%):');

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
				.text(function(d) { return Math.round(d * 100); });

			legend.append('rect')
				.attr('x', 10)
				.attr('y', 75)
				.attr('width', 20)
				.attr('height', 20)
				.attr('fill', 'url(#diagonalHatch)');

			legend.append('text')
				.attr('x', 35)
				.attr('y', 87)
				.text('- new sector in LAD')
		}

		drawLegend();

		var hintWidth = 150;
		var hint;
		function addHint() {
			hint = svg.append('g')
				.classed('vis__hint', true);


			hint.append('rect')
				.attr('x', -5)
				.attr('y', -5)
				.attr('width', hintWidth + 10)
				.attr('height', 60);

			hint.append('text')
				.classed('vis__hint__city', true);

			hint.append('text')
				.classed('vis__hint__start', true)
				.attr('dy', 20);
			hint.append('text')
				.classed('vis__hint__end', true)
				.attr('dy', 35);

			hint.attr('visibility', 'hidden');
		}
		addHint();

		function showHint(d) {
			hint.select('.vis__hint__city').text(d.data.name);
			hint.select('.vis__hint__start').text(
				'{0}: {1}'.format(startYear, d.data.valueOld.separate()) + ' [UNITS?]'
			)
			hint.select('.vis__hint__end').text(
				'{0}: {1}'.format(
					stopYear,
					d.data.valueOld ?
						'{0} ({1}{2})'.format(
							d.value.separate(),
							d.data.change >= 0 ? '+' : '',
							Math.round(d.data.change * 100) + '%'
						) :
						d.value
				) + ' [UNITS?]'
			);

			hint
				.attr('transform', 'translate({0},{1})'.format((d.x0 + d.x1) / 2 - hintWidth / 2, d.y1 + 10))
				.attr('visibility', 'visible');
		}
		function hideHint(d) {
			hint.attr('visibility', 'hidden')
		}
		
		cell
			.on('mouseover', showHint)
			.on('mouseout', hideHint);

		clusters
			.on('mouseover', showHint)
			.on('mouseout', hideHint);
	});
}
draw();
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
	.attr("height", height);



var datareader = new Datareader();
function draw() {
	svg.html('');

	svg.append('pattern')
		.attr('id', 'diagonalHatch')
		.attr('patternUnits', 'userSpaceOnUse')
		.attr('width', 4)
		.attr('height', 4)
		.append('path')
			.attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
			.style('stroke', '#1a9850')
			.style('stroke-width', 1);

	datareader.read('bc_big_sector_year_welsh.csv', function(cities, sectors, years) {
		var treemap = d3.treemap()
			.tile(d3.treemapSquarify)
			.size([width - 200, height])
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
							change: change
						}
					})
				}
			})
		}

		var colorScale = d3.scaleLinear()
			.domain([-maxChange, 0, maxChange])
			.range(['#d73027', '#eee', '#1a9850']);


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

		clusters.append('text')
			.attr('dx', 5)
			.attr('dy', 5)
			.text(function(d) { return d.data.name; });

		var texts = cell.append("text")
			.attr('dx', function(d) { return (d.x1 - d.x0) / 2; })
			.attr('dy', function(d) { return (d.y1 - d.y0) / 2; })
			.text(function(d) { return d.data.name});

		texts.attr('visibility', function(d) {
			return this.getBBox().width <= d.x1 - d.x0 ? 'visible' : 'hidden';
		})
			 /*
			.selectAll("tspan")
				.data(function(d) { console.log(d.data.name); return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
					.enter().append("tspan")
						.attr("x", 4)
						.attr("y", function(d, i) { return 13 + i * 10; })
						.text(function(d) { return d; }); */
		
		function title(d) {
			return '{0}: {1} ({2}{3})'.format(
				d.data.name,
				d.data.value,
				d.data.change >= 0 ? '+' : '',
				d.data.change !== undefined ? Math.round(d.data.change * 100) + '%' : 'NEW'
			);
		}

		cell.append("title").text(title);
		clusters.append('title').text(title);

		function drawLegend() {
			var legend = svg.append('g')
				.classed('vis__legend', true)
				.attr('transform', 'translate({0},{1})'.format(width - 170, 0));

			var legendWidth = 7 * 20;
			legend.append('rect')
				.classed('vis__legend__bg', true)
				.attr('width', 20 + legendWidth)
				.attr('height', 20 + 50);

			legend.append('text') // <-- FIX
				.attr('transform', 'translate({0},{1})'.format(10, 20))
				.text('Change in value (%):');

			var steps = [];
			for (var i = 0; i < 7; i++)
				steps.push(-maxChange + 2 * maxChange / 6 * i);

			legend.selectAll('vis__legend__sample').data(steps).enter().append('rect')
				.classed('vis__legend__sample', true)
				.attr('fill', function(d) { return colorScale(d); })
				.attr('width', 20)
				.attr('height', 20)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format(10 + i * 20, 30);
				});

			var multiplicator = Math.pow(10, 0);

			legend.selectAll('vis__legend__tips').data(steps).enter().append('text')
				.classed('vis__legend__tips', true)
				.attr('transform', function(d, i) {
					return 'translate({0},{1})'.format((i + 0.5) * 20 + 10, 30 + 20);
				})
				.attr('text-anchor', 'middle')
				.attr('alignment-baseline', 'before-edge')
				.text(function(d) { return Math.round(d * multiplicator * 100) / multiplicator; });
		}

		drawLegend();

		/*
		cell
			.on('mouseover', showHint)
			.on('mouseout', hideHint);

		// hint
		var hint = svg.append('g')
			.classed('hint', true);
		hint.append('path');
		hint.append('text');

		function showHint(d) {
			return;
			var text = hint.select('text').text('{0}: {1} ({2}{3})'.format(
				d.data.name,
				d.data.size,
				d.data.change >= 0 ? '+' : '-',
				d.data.change
			));
			var textBox = text.node().getBBox();

			var thisBox = this.getBBox();
			console.log(this);
			console.log(thisBox);
			hint.attr('transform', 'translate({0},{1})'.format(thisBox.x + thisBox.width / 2, thisBox.y + thisBox.height));
			hint.attr('visibility', 'visible');
		}

		function hideHint() {
			return;
			hint.attr('visibility', 'hidden');
		}
		*/
	});
}
draw();
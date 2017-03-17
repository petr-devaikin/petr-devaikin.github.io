var width = 900,
	height = 600;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();
datareader.read('bc_big_sector_year_welsh.csv', function(cities, sectors, years) {
	var treemap = d3.treemap()
		.tile(d3.treemapSquarify)
		.size([width, height])
		.round(true)
		.padding(1)
		.paddingInner(1);

	var maxChange = 0;

	var processedData = {
		name: 'Industries',
		children: sectors.map(function(sector) {
			return {
				name: sector,
				children: Object.keys(cities).map(function(k) {
					var city = cities[k];
					if (city[sector]['2014'] != 0) {
						var change = (city[sector]['2014'] - city[sector]['2009']) / city[sector]['2014'];
						maxChange = Math.max(maxChange, Math.abs(change));
					}
					return {
						name: k,
						size: city[sector]['2014'],
						change: change
					}
				})
			}
		})
	}

	console.log(maxChange);

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
		.attr("fill", function(d) { return colorScale(d.data.change); });

	var clusters = svg.selectAll('.cluster')
		.data(root.descendants().filter(function(d) { return d.depth == 1; }))
		.enter().append('g')
		.classed('cluster', true)
		.attr("transform", function(d) { return "translate({0},{1})".format(d.x0, d.y0); });

	clusters.append('rect')
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
	

	cell.append("title")
		.text(function(d) { return d.data.name; });

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
})
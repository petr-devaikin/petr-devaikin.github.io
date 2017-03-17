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
		.padding(0)
		.paddingInner(0);

	var maxChange = 0;

	var processedData = {
		name: 'Wales',
		children: Object.keys(cities).map(function(city) {
			return {
				name: city,
				children: sectors.map(function(sector) {
					var change = cities[city][sector]['2014'] - cities[city][sector]['2009'];
					maxChange = Math.max(maxChange, change);
					return {
						name: sector,
						size: cities[city][sector]['2014'],
						change: change
					}
				})
			}
		})
	}

	var colorScales = {};
	sectors.forEach(function(sector, i) {
		colorScales[sector] = d3.scaleLinear()
			.domain([0, maxChange])
			.range([d3.hsl(255 / sectors.length * i, .7, .9).rgb(), d3.hsl(255 / sectors.length * i, .7, .5).rgb()]);
	});

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
		.attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

	console.log(colorScales);

	cell.append("rect")
		.attr("id", function(d) { return d.data.id; })
		.attr("width", function(d) { return d.x1 - d.x0; })
		.attr("height", function(d) { return d.y1 - d.y0; })
		.attr("fill", function(d) { console.log(d.data.name); return colorScales[d.data.name](d.data.change); });

	/*
	cell.append("clipPath")
		.attr("id", function(d) { return "clip-" + d.data.id; })
		.append("use")
			.attr("xlink:href", function(d) { return "#" + d.data.id; });
	*/

	var clusters = svg.selectAll('.cluster')
		.data(root.descendants().filter(function(d) { return d.depth == 1; }))
		.enter().append('g')
		.classed('cluster', true)
		.attr("transform", function(d) { return "translate({0},{1})".format(d.x0, d.y0 ); });

	clusters.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', function(d) { return d.x1 - d.x0; })
		.attr('height', function(d) { return d.y1 - d.y0; });

	clusters.append('text')
		.attr('dx', 5)
		.attr('dy', 15)
		.text(function(d) { console.log(d); return d.data.name; });

	/*cell.append("text")
		.attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
		.selectAll("tspan")
			.data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
				.enter().append("tspan")
					.attr("x", 4)
					.attr("y", function(d, i) { return 13 + i * 10; })
					.text(function(d) { return d; });
	*/

	cell.append("title")
		.text(function(d) { return d.data.name; });
})
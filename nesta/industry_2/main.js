var width = 700,
	height = 600;

var svg = d3.select("body").append("svg")
	.classed('vis--stacked', true)
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.IndustryBusinessEmployment, function(years, sectors, data) {
	var yearFilters = d3.select('.legend').select('.legend__years')
		.selectAll('label').data(years).enter().append('label');
	yearFilters.append('input')
		.classed('year-filter', true)
		.attr('type', 'radio')
		.attr('name', 'year')
		.attr('value', function(d) { return d; })
		.attr('checked', function(d, i) { return i == years.length - 1 ? 'checked' : null; });
	yearFilters.append('span').text(function(d) { return d; });

	var graph = new Barchart(svg, years, sectors, data, {
	});
	graph.draw(
		d3.select('.x-filter:checked').node().value,
		d3.select('.x-filter:checked').attr('title'),
		d3.select('.y-filter:checked').node().value,
		d3.select('.y-filter:checked').attr('title'),
		d3.select('.year-filter:checked').node().value
	);

	d3.select('.legend').selectAll('input')
		.on('click', function() {
			graph.draw(
				d3.select('.x-filter:checked').node().value,
				d3.select('.x-filter:checked').attr('title'),
				d3.select('.y-filter:checked').node().value,
				d3.select('.y-filter:checked').attr('title'),
				d3.select('.year-filter:checked').node().value
			);
		});
});
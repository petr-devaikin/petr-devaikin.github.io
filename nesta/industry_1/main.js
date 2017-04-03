var width = 700,
	height = 600;

var svg = d3.select("body").append("svg")
	.classed('vis--stacked', true)
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.IndustryBusiness, function(yearsBusiness, ladsBusiness, sectorsBusiness) {
	datareader.readData(Datareader.DATASETS.IndustryEmployment, function(yearsEmployment, ladsEmployment, sectorsEmployment) {
		var datasets = {
			'business': {
				years: yearsBusiness,
				sectors: sectorsBusiness
			},
			'employment': {
				years: yearsEmployment,
				sectors: sectorsEmployment
			},
		}
		var graph = new Stacked(svg, datasets, {
		});
		graph.draw(d3.select('.value-filter:checked').node().value);

		d3.selectAll('.value-filter')
			.on('click', function() {
				graph.draw(this.value);
			});
	});
});
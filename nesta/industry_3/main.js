var width = window.innerWidth,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.classed('vis--geovis', true)
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();


datareader.readData(Datareader.DATASETS.LadsMap, function(lads) {
	datareader.readData(Datareader.DATASETS.Lads, function(gbLads) {
		datareader.readData(Datareader.DATASETS.LadsEmploymentBusiness, function(ladNames, sectors, subsectors, data) {
			console.log(data.length);
			var bivariate = new Bivariate(svg, lads, gbLads, data, {

			});

			bivariate.draw();
		});
	});
});
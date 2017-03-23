var width = window.innerWidth,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();


datareader.readData(Datareader.DATASETS.LadsMap, function(lads) {
	datareader.readData(Datareader.DATASETS.Lads, function(gbLads) {
		var scale0 = 6000;
		var t = d3.zoomIdentity.translate(width / 2, height / 2).scale(scale0);

		var projection = d3.geoAlbers()
			.center([2, 53.5])
			.rotate([4.4, 0])
			.parallels([50, 60])
			.scale(scale0)
			.translate([width / 2, height / 2]);
	    var path = d3.geoPath(projection);

	    console.log(gbLads);

	    svg.selectAll(".subunit")
			.data(lads.features)
			.enter().append("path")
			.attr('fill', function(d) { return gbLads[d.properties.lad16nm] == 'Wales' ? 'red' : 'silver'; })
			.attr('stroke', function(d) { return gbLads[d.properties.lad16nm] == 'Wales' ? 'black' : 'white'; })
			//.attr('stroke-width', 1)
			//.attr("class", function(d) { return "subunit " + d.properties.lad16cd; })
			.attr("d", path);


		function zoomed() {
			var transform = d3.event.transform;

			projection
				.translate([transform.x, transform.y])
				.scale(transform.k);

			svg.selectAll("path")
				.attr("d", path);
		}

	    var zoom = d3.zoom()
			.scaleExtent([scale0, 8 * scale0])
			.on("zoom", zoomed);

		svg.call(zoom.transform, t);
		svg.call(zoom);
	});

	

	// countries
	
	/*
	svg.selectAll(".subunit-label")
		.data(topojson.feature(uk, uk.objects.subunits).features)
		.enter().append("text")
		.attr("class", function(d) { return "subunit-label " + d.id; })
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.text(function(d) { return d.properties.BRK_NAME; });*/

});
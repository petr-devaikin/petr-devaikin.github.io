var width = 700,
	height = 650;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


d3.json("uk.json", function(error, uk) {
	if (error) return console.error(error);

	var subunits = topojson.feature(uk, uk.objects.subunits);
	var projection = d3.geoAlbers()
		.center([0, 55.4])
		.rotate([4.4, 0])
		.parallels([50, 60])
		.scale(3000)
		.translate([width / 2, height / 2]);
    var path = d3.geoPath(projection);

    svg.selectAll(".subunit")
		.data(topojson.feature(uk, uk.objects.subunits).features)
		.enter().append("path")
		.attr("class", function(d) { return "subunit " + d.properties.BRK_A3; })
		.attr("d", path);

	svg.append("path")
		.datum(topojson.mesh(uk, uk.objects.subunits, function(a, b) { return a !== b && a.id !== "IRL"; }))
		.attr("d", path)
		.attr("class", "subunit-boundary");

	svg.append("path")
		.datum(topojson.mesh(uk, uk.objects.subunits, function(a, b) { return a === b && a.id === "IRL"; }))
		.attr("d", path)
		.attr("class", "subunit-boundary IRL");

	// countries
	console.log(topojson.feature(uk, uk.objects.subunits).features);
	svg.selectAll(".subunit-label")
		.data(topojson.feature(uk, uk.objects.subunits).features)
		.enter().append("text")
		.attr("class", function(d) { return "subunit-label " + d.id; })
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.text(function(d) { return d.properties.BRK_NAME; });

	// cities
	var places = topojson.feature(uk, uk.objects.place);
	svg.append("path")
		.datum(places)
		.attr("d", path)
		.attr("class", "place");

	svg.selectAll(".place-label")
		.data(places.features)
			.enter().append("text")
				.attr("class", "place-label")
				.attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
				.attr("dy", ".35em")
				.text(function(d) { return d.properties.ADM1NAME; });

	svg.selectAll(".place-label")
		.attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
		.style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; });
});
var width = 700,
	height = 650;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


d3.json("uk.json", function(error, uk) {
	if (error) return console.error(error);

	var subunits = topojson.feature(uk, uk.objects.subunits);
	var projection = d3.geoAlbers()
		.center([0, 53])
		.rotate([4.4, 0])
		.parallels([50, 60])
		.scale(5500)
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
	
	svg.selectAll(".subunit-label")
		.data(topojson.feature(uk, uk.objects.subunits).features)
		.enter().append("text")
		.attr("class", function(d) { return "subunit-label " + d.id; })
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.text(function(d) { return d.properties.BRK_NAME; });

	// districts
	var districts = topojson.feature(uk, uk.objects.districts).features;
	console.log(districts);


	// cities
	/*var places = topojson.feature(uk, uk.objects.place);
	console.log(uk.objects);
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
		.style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; });*/


	// load data

	function findCityOnMap(name) {
		return districts.find(function(a) {
			return a.properties.name.toLowerCase() == name.toLowerCase();
		});
	}

	d3.csv('normalised_attendants_in_other_cities.csv', function(data) {
		var cities = {};
		var citiesTo = [];

		function addCity(name) {
			if (cities[name] === undefined) {
				var district = findCityOnMap(name);
				cities[name] = {
					name: name,
					path: district,
					income: 0,
					outcome: 0,
					incomeCities: [],
					outcomeCities: []
				}
			}
			return cities[name];
		}

		for (var prop in data[0])
			if (prop != 'lad_name' && data[0].hasOwnProperty(prop)) {
				addCity(prop);
				citiesTo.push(prop);
			}

		for (var i = 0 ; i < data.length; i++) {
			var row = data[i];
			var name = row['LAD13NM_LGDName'];
			var city = addCity(name);
			for (var j = 0; j < citiesTo.length; j++) {
				var secondCity = cities[citiesTo[j]];
				var v = parseInt(row[citiesTo[j]]);
				if (v > 0 && city.path !== undefined && secondCity.path !== undefined &&
							 (city.path.properties.geonunit == 'Wales' || secondCity.path.properties.geonunit == 'Wales')) {
					city.income += v;
					city.incomeCities.push({
						city: secondCity,
						value: v
					});
					secondCity.outcome += v;
					secondCity.outcomeCities.push({
						city: city,
						value: v
					});
				}
			}
		}

		var keys = Object.keys(cities);
		var cityArray = keys.map(function(v) { return cities[v]; }).filter(function(d) {
			return d.outcome > 0 || d.income > 0;
		});

		var mapCities = svg.selectAll('.city').data(cityArray).enter()
			.append('g')
				.classed('city', true)
				.attr('transform', function(d) { return "translate(" + path.centroid(d.path.geometry) + ")"; });

		mapCities
			.append('circle')
				.attr('r', function(d) { return Math.sqrt(d.income) * 10; })
				.attr('fill', 'rgba(255,0,0,.3)');

		mapCities
			.append('circle')
				.attr('r', function(d) { return Math.sqrt(d.outcome) * 10; })
				.attr('fill', 'rgba(0,0,255,.3)');

		mapCities.each(function(d) {
			d3.select(this).selectAll('.line.lineIncome').data(function(d) { return d.incomeCities; }).enter()
				.append('line')
					.attr('x1', 0).attr('y1', 0)
					.attr('x2', function(dd) {
						return path.centroid(dd.city.path.geometry)[0] - path.centroid(d.path.geometry)[0];
					})
					.attr('y2', function(dd) {
						return path.centroid(dd.city.path.geometry)[1] - path.centroid(d.path.geometry)[1];
					})
					.attr('stroke', 'rgb(255,0,0)')
					.attr('stroke-width', function(dd) { return dd.value * 2; })
					.attr('visibility', 'hidden');
			d3.select(this).selectAll('.line.lineOutcome').data(function(d) { return d.outcomeCities; }).enter()
				.append('line')
					.attr('x1', 0).attr('y1', 0)
					.attr('x2', function(dd) {
						return path.centroid(dd.city.path.geometry)[0] - path.centroid(d.path.geometry)[0];
					})
					.attr('y2', function(dd) {
						return path.centroid(dd.city.path.geometry)[1] - path.centroid(d.path.geometry)[1];
					})
					.attr('stroke', 'rgb(0,0,255)')
					.attr('stroke-width', function(dd) { return dd.value * 2; })
					.attr('visibility', 'hidden');
		});

		mapCities.append('text')
			.attr('font-size', 12)
			.text(function(d) { return d.name; });

		mapCities.on('mouseover', function(d) {
			d3.select(this).selectAll('line').attr('visibility', 'visible');
			svg.selectAll('.city').filter(function(dd) {
				return dd != d && 
					d.incomeCities.find(function(c) { return c.city == dd; }) === undefined && 
					d.outcomeCities.find(function(c) { return c.city == dd; }) === undefined;
			}).classed('blured', true);
		});
		mapCities.on('mouseout', function(d) {
			d3.select(this).selectAll('line').attr('visibility', 'hidden');
			svg.selectAll('.city.blured').classed('blured', false);
		});
	});
});
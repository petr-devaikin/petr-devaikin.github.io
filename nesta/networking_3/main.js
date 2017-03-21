var width = 700,
	height = 700;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);



d3.json("uk.json", function(error, uk) {
	if (error) return console.error(error);

	var subunits = topojson.feature(uk, uk.objects.subunits);
	var projection = d3.geoAlbers()
		.center([2, 53.5])
		.rotate([4.4, 0])
		.parallels([50, 60])
		.scale(6000)
		.translate([width / 2, height / 2]);
    var path = d3.geoPath(projection);

    svg.selectAll(".subunit")
		.data(subunits.features)
		.enter().append("path")
		.attr("class", function(d) { return "subunit " + d.properties.BRK_A3; })
		.attr("d", path);

	// countries
	
	/*
	svg.selectAll(".subunit-label")
		.data(topojson.feature(uk, uk.objects.subunits).features)
		.enter().append("text")
		.attr("class", function(d) { return "subunit-label " + d.id; })
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.text(function(d) { return d.properties.BRK_NAME; });*/

	d3.json('lads.json', function(error2, lads) {
		var cityCoordinates = {};
		lads.features.forEach(function(c) {
			cityCoordinates[c.properties.lad16nm] = [c.properties.long, c.properties.lat];
		});

		d3.csv('find_area_from_lad.csv', function(citiesData) {
			var welshCities = [];
			for (var i = 0; i < citiesData.length; i++)
				if (citiesData[i].Areas == 'Wales')
					welshCities.push(citiesData[i].LAD13NM_LGDName);

			function isWelsh(cityName) {
				return welshCities.indexOf(cityName) != -1;
			}
		
			d3.csv('normalised_attendants_in_other_cities.csv', function(data) {
				var cities = {};
				var citiesTo = [];

				var maxValue = 0;

				function addCity(name) {
					if (cities[name] === undefined) {
						var coords = cityCoordinates[name];
						if (coords === undefined)
							console.log('NOT FOUND: ' + name);
							else
								cities[name] = {
									name: name,
									coords: coords,
									sum: 0,
									connections: []
								}
					}
					return cities[name];
				}

				for (var prop in data[0])
					if (prop != 'LAD13NM_LGDName' && data[0].hasOwnProperty(prop)) {
						addCity(prop);
						citiesTo.push(prop);
					}

				for (var i = 0 ; i < data.length; i++) {
					var row = data[i];
					var name = row['LAD13NM_LGDName'];
					var city1 = addCity(name);

					if (city1 === undefined) continue; // not on map!

					citiesTo.forEach(function(cityName2) {
						var city2 = cities[cityName2];
						var value = parseFloat(row[cityName2]);

						if (city2 === undefined) return; // not on map!

						if (value > 0 && (isWelsh(city1.name) || isWelsh(city2.name))) {
							city1.sum += value;
							city2.sum += value;
							var connection = city1.connections.find(function(c) { return c.to == city2; });
							if (connection === undefined)
								city1.connections.push({
									to: city2,
									value: value,
								});
							else
								connection.value += value;

							city2.connections.find(function(c) { return c.to == city1; });
							if (connection === undefined)
								city2.connections.push({
									to: city1,
									value: value,
								});
							else
								connection.value += value;


						}
					});
				}

				var cityArray = Object.keys(cities).map(function(v) { return cities[v]; }).filter(function(d) {
					d.connections.forEach(function(cc) {
						maxValue = Math.max(maxValue, cc.value);
					})
					return d.sum > 0;
				});


				var colorScale = d3.scaleLinear()
					.domain([0, maxValue])
					.range(['red', 'blue']);

				var mapCities = svg.selectAll('.city').data(cityArray).enter()
					.append('g')
						.classed('city', true)
						.attr('transform', function(d) { return "translate(" + projection(d.coords) + ")"; });

					
				mapCities.each(function(d) {
					d3.select(this).selectAll('.line.lineIncome').data(function(d) { return d.connections; }).enter()
						.append('line')
							.attr('x1', 0).attr('y1', 0)
							.attr('x2', function(dd) {
								return projection(dd.to.coords)[0] - projection(d.coords)[0];
							})
							.attr('y2', function(dd) {
								return projection(dd.to.coords)[1] - projection(d.coords)[1];
							})
							.attr('stroke', 'rgba(255, 0, 0, .1)')
							.style('pointer-events', 'none')
							.attr('stroke-width', 1)
							//.attr('opacity', function(d) { return Math.log(d.value / maxValue); })
							.attr('visibility', 'visible');
				});

				mapCities
					.append('circle')
						.attr('r', function(d) { return Math.sqrt(d.sum) * 10; })
						.attr('fill', function(d) {
							if (isWelsh(d.name))
								return 'rgba(255,0,0,.3)';
							else
								return 'rgba(0,0,255,.3)';
						});

				mapCities.append('text')
					.attr('font-size', 10)
					.attr('text-anchor', 'middle')
					.style('pointer-events', 'none')
					.text(function(d) { return d.name; })
					.attr('visibility', 'hidden');

				mapCities.on('mouseover', function(d) {
					d3.select(this).selectAll('line').attr('visibility', 'visible');
					d3.select(this).select('text').attr('visibility', 'visible');

					svg.selectAll('.city').filter(function(dd) {
						return dd != d && d.connections.find(function(c) { return c.to == dd; }) === undefined;
					}).classed('blured', true);

					svg.selectAll('.city').filter(function(dd) {
						return d.connections.find(function(c) { return c.to == dd; }) !== undefined;
					}).select('text').attr('visibility', 'visible');
				});
				mapCities.on('mouseout', function(d) {
					d3.select(this).selectAll('line').attr('visibility', 'hidden');
					d3.selectAll('.city').select('text').attr('visibility', 'hidden');
					svg.selectAll('.city.blured').classed('blured', false);
				});


			});
		});
	});
});
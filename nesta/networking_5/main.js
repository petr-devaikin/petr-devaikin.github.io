var width = window.innerWidth,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.classed('vis--geovis', true)
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();

var lad2city = {
	'Gwynedd': 'Bangor',
	'Cardiff': 'Cardiff',
	'Swansea': 'Swansea',
	'Pembrokeshire': 'Roch',
	'Carmarthenshire': 'Llansadwrn',
	'Blaenau Gwent': 'Cwm',
}


datareader.readData(Datareader.DATASETS.LadsMap, function(lads) {
	datareader.readData(Datareader.DATASETS.Lads, function(gbLads) {
		datareader.readData(Datareader.DATASETS.TopicPopularity, function(years, topics, data) {
			var params = {
				legendSteps: 5,
				legendSampleWidth: 40,
				legendSampleHeight: 20,
				legendText: 'Popularity of topic ?? [UNITS?]',
				minColor: '#ffeda0',
				maxColor: '#f03b20',
			}

			svg.html('');

			var selectedYear = '2016',
				selectedTopic = topics[0],
				showOnlyWales = false;

			var maxValue = 1;

			var colorSteps = [];
			for (var i = 0; i < params.legendSteps; i++)
				colorSteps.push(d3.interpolateRgb(params.minColor, params.maxColor)(i / (params.legendSteps - 1)));

			colorScale = d3.scaleQuantize()
				.domain([0, maxValue])
				.range(colorSteps);


			function draw() {
				var map = svg.append('g').classed('vis__map', true);

				// calculate initial zoom
				var areasToZoom = ['Wales', 'England'];

				var meshToZoom = topojson.mesh(
					lads,
					lads.objects.lads,
					function(a, b) {
						var aArea = gbLads[a.properties.lad16nm];
						var bArea = gbLads[b.properties.lad16nm];
						if (a === b && (areasToZoom.indexOf(aArea)) != -1)
							return true;

						if (a !== b &&
							((areasToZoom.indexOf(aArea) != -1 && areasToZoom.indexOf(bArea) == -1) ||
							 (areasToZoom.indexOf(aArea) != -1 && areasToZoom.indexOf(bArea) == -1))
							)
							return true;

						return false;
					}
				);

				var projection = d3.geoAlbers()
					.rotate([4.4, 0])
					.parallels([50, 60])
					.fitSize([width - 250, height], meshToZoom);

			    var path = d3.geoPath(projection);

				var subunits = topojson.feature(lads, lads.objects.lads);

			    map.selectAll(".vis__map__lad")
					.data(subunits.features)
					.enter().append("path")
				    	.classed('vis__map__lad', true)
						.classed('vis__map__lad--welsh', function(d) { return gbLads[d.properties.lad16nm] == 'Wales'; })
						.attr("d", path)
						.on('mouseover', showHint)
						.on('mouseout', hideHint);

				map.append('path')
					.classed('vis__map__border', true)
					.datum(topojson.mesh(
						lads,
						lads.objects.lads,
						function(a, b) { return a !== b && (
							(gbLads[b.properties.lad16nm] != 'Wales' && gbLads[a.properties.lad16nm] == 'Wales') ||
							(gbLads[b.properties.lad16nm] == 'Wales' && gbLads[a.properties.lad16nm] != 'Wales')); }
					))
					.attr('d', path);

				// behaviour

				function zoomed() {
					var transform = d3.event.transform;

					projection
						.translate([transform.x, transform.y])
						.scale(transform.k);

					map.selectAll(".vis__map__lad").attr("d", path);
					map.selectAll(".vis__map__border").attr("d", path);
				}


				var scale0 = projection.scale(),
					translate0 = projection.translate();

			    var zoom = d3.zoom()
					.scaleExtent([0.5 * scale0, 3 * scale0])
					.on("zoom", zoomed);

				var t = d3.zoomIdentity
					.translate(translate0[0], translate0[1])
					.scale(scale0);

				svg.call(zoom.transform, t);
				svg.call(zoom);
			}
			draw();

			function repaint() {
				var map = svg.select('.vis__map');
				maxValue = 0;

				var selectedData = data[selectedYear];
				
				map.selectAll(".vis__map__lad").each(function(d) {
					var ladName = d.properties.lad16nm;
					if (showOnlyWales && gbLads[ladName] != 'Wales') return;
					var city = lad2city[ladName] !== undefined ? lad2city[ladName] : ladName;
					if (selectedData[city] !== undefined)
						maxValue = Math.max(maxValue, selectedData[city][selectedTopic]);
				});
				colorScale.domain([0, maxValue]);


				map.selectAll(".vis__map__lad")
					.attr('fill', function(d) {
						var ladName = d.properties.lad16nm;

						if (showOnlyWales && gbLads[ladName] != 'Wales') return null;

						var city = lad2city[ladName] !== undefined ? lad2city[ladName] : ladName;
						if (selectedData[city] !== undefined)
							return colorScale(selectedData[city][selectedTopic]);
						else
							return null;
					})
					.classed('no-data', function(d) {
						var ladName = d.properties.lad16nm;
						if (showOnlyWales && gbLads[ladName] != 'Wales')
							return true;

						var city = lad2city[ladName] !== undefined ? lad2city[ladName] : ladName;
						if (selectedData[city] === undefined)
							return true;

						return false;
					});

				function repaintKey() {
					var steps = []
					for (var i = 0; i < params.legendSteps; i++)
						steps.push(maxValue / params.legendSteps * i);
					steps.push(maxValue);
					d3.select('.vis__legend').selectAll('.vis__legend__tips').data(steps)
						.text(function(d, i) { return d.abbrNum(2); })

				}
				repaintKey();
			}


			// legend
			function drawLegend() {
				var legend = d3.select('body').append('div').classed('legend', true);

				legend.append('h1').text('Years');
				years.forEach(function(year) {
					legend.append('label')
						.text(year)
						.append('input')
							.attr('type', 'radio')
							.attr('name', 'year')
							.attr('value', year)
							.attr('checked', year == '2016' ? 'checked' : null)
							.on('change', function() {
								selectedYear = year;
								repaint();
							});
				});

				legend.append('h1').text('Topics');

				topics.forEach(function(topic) {
					legend.append('label')
						.classed('topic', true)
						.datum(topic)
						.text(topic)
						.append('input')
							.attr('type', 'radio')
							.attr('name', 'topic')
							.attr('value', topic)
							.attr('checked', function(d) { return d == selectedTopic ? 'checked' : null})
							.on('change', function() {
								selectedTopic = topic;
								repaint();
							});
				});

				legend.append('h1').text('GB');
				legend.append('label')
					.text('Show only Walse')
					.append('input')
						.attr('type', 'checkbox')
						.on('change', function() {
							showOnlyWales = this.checked;
							repaint();
						});
			}
			drawLegend();

			function drawKey() {
				var legend = svg.append('g')
					.classed('vis__legend', true)
					.attr('transform', 'translate({0},{1})'.format(width - 500, 10));

				var legendWidth = params.legendSteps * params.legendSampleWidth;
				legend.append('rect')
					.classed('vis__legend__bg', true)
					.attr('width', 20 + legendWidth)
					.attr('height', params.legendSampleHeight + 50);

				legend.append('text') // <-- FIX
					.attr('transform', 'translate({0},{1})'.format(10, 20))
					.text(params.legendText);

				var steps = d3.range(params.legendSteps).map(function(i) {
					return i * maxValue / params.legendSteps;
				});

				legend.selectAll('vis__legend__sample').data(steps).enter().append('rect')
					.classed('vis__legend__sample', true)
					.attr('width', params.legendSampleWidth)
					.attr('height', params.legendSampleHeight)
					.attr('fill', function(d) { return colorScale(d); })
					.attr('transform', function(d, i) {
						return 'translate({0},{1})'.format(10 + i * params.legendSampleWidth, 30);
					});

				var ticks = d3.range(params.legendSteps + 1);

				legend.selectAll('vis__legend__tips').data(ticks).enter().append('text')
					.classed('vis__legend__tips', true)
					.attr('transform', function(d, i) {
						return 'translate({0},{1})'.format(i * params.legendSampleWidth + 10, 30 + params.legendSampleHeight);
					})
					.attr('text-anchor', function(d, i) {
						if (i == 0)
							return 'start';
						else if (i == params.legendSteps)
							return 'end';
						else
							return 'middle';
					})
					.attr('alignment-baseline', 'before-edge');
			}
			drawKey();

			repaint();


			function addHint() {
				var hint = svg.append('g')
					.classed('vis__hint', true)
					.attr('visibility', 'hidden');

				hint.append('rect')
					.attr('x', -5)
					.attr('y', -5)
					.attr('width', 200)
					.attr('height', 200);

				hint.append('text')
					.classed('vis__hint__city', true);

				for (var i = 0; i < 6; i++)
					hint.append('text')
						.classed('vis__hint__topic', true)
						.attr('dy', 20 + 12 * i);
			}
			addHint();

			function showHint(d) {
				var hint = d3.select('.vis__hint');

				var selectedData = data[selectedYear];

				var ladName = d.properties.lad16nm;
				var city = lad2city[ladName] !== undefined ? lad2city[ladName] : ladName;

				hint.select('rect').attr('x', 0).attr('y', 0).attr('width', 0).attr('height', 0);

				hint.select('.vis__hint__city').text(ladName);

				if (selectedData[city] !== undefined) {
					var topicsHash = selectedData[city];
					var topics = Object.keys(topicsHash)
						.filter(function(t) { return topicsHash[t] > 0; })
						.map(function(t) { return { name: t, popularity: topicsHash[t] }; });

					var topicsOriginalCount = topics.length;

					topics.sort(function(a, b) { return b.popularity - a.popularity; });

					if (topicsHash[selectedTopic] == 0) {
						if (topics.length > 4) {
							topics = topics.slice(0, 3);
							topics.push('...');
						}
						topics.push({ name: selectedTopic, popularity: 0 });
					}

					hint.selectAll('.vis__hint__topic').data(topics).enter().append('text')
						.classed('vis__hint__topic', true)
						.attr('dy', function(dd, i) { return 20 + 15 * i; })
						.classed('selected', function(dd) { return dd.name == selectedTopic; })
						.text(function(topic, i) {
							if (topic === '...')
								return '...'
							else if (topic.popularity > 0)
								return '{0}. {1} - {2}'.format(i + 1, topic.name, topic.popularity.abbrNum(2));
							else
								return '{0}. {1} - {2}'.format(topicsOriginalCount + 1, topic.name, topic.popularity.abbrNum(2));
						});

					if (topicsHash[selectedTopic] == 0)
						topics.slice(0, 3);
				}
				else
					hint.append('text')
						.classed('vis__hint__topic', true)
						.attr('dy', 20)
						.text('no data');

				var hintBBox = hint.node().getBBox();
				hint.select('rect')
					.attr('x', -5)
					.attr('y', -5)
					.attr('width', hintBBox.width + 10)
					.attr('height', hintBBox.height + 10);

				var bbox = this.getBBox();

				svg.select('.vis__hint')
					.attr('transform', 'translate({0},{1})'.format(bbox.x + (bbox.width - hintBBox.width) / 2, bbox.y + bbox.height + 10))
					.attr('visibility', 'visible');
			}

			function hideHint() {
				svg.select('.vis__hint')
					.attr('visibility', 'hidden')
					.selectAll('.vis__hint__topic').remove();
			}
		});
	});
});
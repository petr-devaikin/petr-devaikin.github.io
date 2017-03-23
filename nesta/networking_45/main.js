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
			svg.html('');

			var selectedYear = '2016',
				selectedTopic = 'all',
				showOnlyWales = false;

			var topicScale = d3.scaleOrdinal(d3.schemeCategory20)
				.domain(topics);

			var rangeScale = d3.scaleLinear()
				.range(['#ffeda0', '#f03b20']);


			function draw() {
				var map = svg.append('g').classed('vis__map', true);

				var scale0 = 6000;
				var t = d3.zoomIdentity.translate(width / 2, height / 2).scale(scale0);

				var subunits = topojson.feature(lads, lads.objects.lads);

				var projection = d3.geoAlbers()
					.center([2, 52.5])
					.rotate([4.4, 0])
					.parallels([50, 60]);
			    var path = d3.geoPath(projection);

			    map.selectAll(".vis__map__lad")
					.data(subunits.features)
					.enter().append("path")
				    	.classed('vis__map__lad', true)
						.classed('vis__map__lad--welsh', function(d) { return gbLads[d.properties.lad16nm] == 'Wales'; })
						.attr("d", path);

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

					map.selectAll("path")
						.attr("d", path);
				}

			    var zoom = d3.zoom()
					.scaleExtent([0.5 * scale0, 3 * scale0])
					.on("zoom", zoomed);

				svg.call(zoom.transform, t);
				svg.call(zoom);
			}
			draw();

			function repaint() {
				var map = svg.select('.vis__map');

				var maxValue = 0;

				var selectedData = data[selectedYear];
				
				if (selectedTopic == 'all') {
					for (var lad in selectedData) {
						var arr = Object.keys(selectedData[lad]).map(function(topic) {
							return {
								topic: topic,
								popularity: selectedData[lad][topic]
							};
						});
						arr.sort(function(a, b) { return b.popularity - a.popularity; });
						selectedData[lad].favorite = arr[0];
					}
				}
				else {
					map.selectAll(".vis__map__lad").each(function(d) {
						var ladName = d.properties.lad16nm;
						if (showOnlyWales && gbLads[ladName] != 'Wales') return;
						var city = lad2city[ladName] !== undefined ? lad2city[ladName] : ladName;
						if (selectedData[city] !== undefined)
							maxValue = Math.max(maxValue, selectedData[city][selectedTopic]);
					});
					rangeScale.domain([0, maxValue]);
					console.log(rangeScale(maxValue));
				}

				map.selectAll(".vis__map__lad")
					.attr('fill', function(d) {
						var ladName = d.properties.lad16nm;

						if (showOnlyWales && gbLads[ladName] != 'Wales') return 'rgb(240, 240, 240)';

						var city = lad2city[ladName] !== undefined ? lad2city[ladName] : ladName;
						if (selectedData[city] !== undefined) {
							if (selectedTopic == 'all')
								return topicScale(selectedData[city].favorite.topic);
							else
								return rangeScale(selectedData[city][selectedTopic]);
						}
						else {
							//if (gbLads[ladName] == 'Wales')
							//	console.log(d.properties.lad16nm);
							return 'rgb(240, 240, 240)';
						}
					})
					.on('mouseover', function(d) {
						var ladName = d.properties.lad16nm;
						if (showOnlyWales && gbLads[ladName] != 'Wales') return 'rgb(240, 240, 240)';
						var city = lad2city[ladName] !== undefined ? lad2city[ladName] : ladName;

						var text = 'no data';

						if (selectedData[city] !== undefined)
							if (selectedTopic == 'all')
								text = 'Popular topic: ' + selectedData[city].favorite.topic;
							else
								text = selectedTopic + ' popularity: ' + selectedData[city][selectedTopic];

						var bbox = this.getBBox();

						svg.select('.vis__hint')
							.attr('transform', 'translate({0},{1})'.format(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2))
							.attr('visibility', 'visible')
							.select('text')
								.text(d.properties.lad16nm + '. ' + text);
					})
					.on('mouseout', function() {
						svg.select('.vis__hint').attr('visibility', 'hidden');
					});


				d3.select('.legend').selectAll('.topic')
					.style('border-left-color', function(d) {
						if (selectedTopic !== 'all' || d == 'all')
							return '#fff';
						else
							return topicScale(d);
					})
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

				legend.append('label')
					.classed('topic', true)
					.datum('all')
					.text('All')
					.append('input')
						.attr('type', 'radio')
						.attr('name', 'topic')
						.attr('value', 'all')
						.attr('checked', 'checked')
						.on('change', function() {
							selectedTopic = 'all';
							repaint();
						});

				topics.forEach(function(topic) {
					legend.append('label')
						.classed('topic', true)
						.datum(topic)
						.text(topic)
						.append('input')
							.attr('type', 'radio')
							.attr('name', 'topic')
							.attr('value', topic)
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
			repaint();


			function addHint() {
				var hint = svg.append('g')
					.classed('vis__hint', true)
					.attr('visibility', 'hidden');

				hint.append('text');
			}
			addHint();
		});
	});
});
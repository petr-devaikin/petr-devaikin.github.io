var width = window.innerWidth - 230,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();


datareader.readData(Datareader.DATASETS.LadsMap, function(lads) {
	datareader.readData(Datareader.DATASETS.Lads, function(ladAreas) {
		datareader.readData(Datareader.DATASETS.Movement, function(topics, inwardData, outwardData) {
			var selectedTopic = topics[0];
			topics.sort();

			inwardData.forEach(function(d) { return d.category = 'inward'; });
			outwardData.forEach(function(d) { return d.category = 'outward'; });
			var data = inwardData.concat(outwardData);
			var filteredData = data.filter(function(d) { return d.topic == selectedTopic; });

			var ladNamesFromMap = topojson.feature(lads, lads.objects.lads).features.map(function(d) { return d.properties.lad16nm; });
			ladNamesFromMap.sort();
			ladNamesFromMap = ladNamesFromMap.map(function(d) { return { id: d, text: d }; });

			var geovis = new Geovis(svg, lads, ladAreas, filteredData, {
				categoryColors: {
					'inward': 'green',
					'outward': 'blue',
				},
				labelLeft: 'People registred in Wales attending an event in other areas [?]',
				labelRight: 'People registred out of Wales attending an event in Wales [?]',
				buttonSize: 30,
				selectLadCallback: function(ladName) {
					ladCallbacks.setValue(ladName);
				}
			});

			geovis.draw();

			function redraw() {
				var filteredData = data.filter(function(d) { return d.topic == selectedTopic; });
				geovis.redraw(filteredData);
			}

			function selectLad(lad) {
				geovis.select(lad);
			}

			// Filter
			var filter = new Filter(d3.select('.filter'));

			filter.addSelectSearchSection(
				'Topics',
				topics.map(function(s) { return { id: s, text: s }; }),
				'',
				function(v) {
					selectedTopic = v;
					redraw();
				},
				selectedTopic
			);

			var ladCallbacks = filter.addSelectSearchSection(
				'Local Authority District',
				[{ id: '', text: '' }].concat(ladNamesFromMap),
				'Search for LAD',
				function(v) {
					selectLad(v);
				});

			filter.addArrowKey(
				'Connections',
				[
					{ thickness: 2, color: 'blue', description: 'Owtward movement [?]' },
					{ thickness: 2, color: 'green', description: 'Inward movement [?]' },
				],
				'Line opacity shows the probability of a user who registred in one LAD to attend an event in another area [?]'
				);
		});
	});
});
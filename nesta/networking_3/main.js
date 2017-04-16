var width = window.innerWidth - 200,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();


datareader.readData(Datareader.DATASETS.LadsMap, function(lads) {
	datareader.readData(Datareader.DATASETS.Lads, function(ladAreas) {
		datareader.readData(Datareader.DATASETS.Movement, function(topics, inwardData, outwardData) {
			var selectedTopic = topics[0];

			inwardData.forEach(function(d) { return d.category = 'inward'; });
			outwardData.forEach(function(d) { return d.category = 'outward'; });
			var data = inwardData.concat(outwardData);
			var filteredData = data.filter(function(d) { return d.topic == selectedTopic; });

			console.log(filteredData.length);

			var geovis = new Geovis(svg, lads, ladAreas, filteredData, {
				categoryColors: {
					'inward': 'green',
					'outward': 'blue',
				}
			});

			geovis.draw();

			function redraw() {
				var filteredData = data.filter(function(d) { return d.topic == selectedTopic; });
				geovis.redraw(filteredData);
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
				});
		});
	});
});
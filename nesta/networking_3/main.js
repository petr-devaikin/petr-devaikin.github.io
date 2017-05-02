var width = window.innerWidth - 230,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();


datareader.readData(Datareader.DATASETS.LadsMapUK, function(ladsGB, ladsNI) {
	datareader.readData(Datareader.DATASETS.Lads, function(ladAreas) {
		datareader.readData(Datareader.DATASETS.Movement, function(topics, inwardData, outwardData) {
			var selectedTopic = '';
			topics.sort();

			inwardData.forEach(function(d) {
				d.category = d.topic;
				d.type = 'inward';
			});
			outwardData.forEach(function(d) { 
				d.category = d.topic;
				d.type = 'outward';
			});
			var data = inwardData.concat(outwardData);
			var filteredData = data.filter(function(d) { return selectedTopic == '' || d.topic == selectedTopic; });

			function getLadNames() {
				var filtered = [];
				data.filter(function(d) { return selectedTopic == '' || d.topic == selectedTopic; }).forEach(function(d) {
					if (filtered.indexOf(d.from) == -1) filtered.push(d.from);
					if (filtered.indexOf(d.to) == -1) filtered.push(d.to);
				});
				return [{ id: '', text: '' }].concat(filtered.map(function(d) { return { id: d, text: d }; }));
			}

			var geovis = new Geovis(svg, ladsGB, ladsNI, ladAreas, filteredData, topics, {
				labelLeft: 'People registered in Wales attending an event in other areas [?]',
				labelRight: 'People registered out of Wales attending an event in Wales [?]',
				buttonSize: 30,
				selectLadCallback: function(ladName) {
					ladCallbacks.setValue(ladName);
				}
			});

			function redraw() {
				var filteredData = data.filter(function(d) { return selectedTopic == '' || d.topic == selectedTopic; });
				geovis.redraw(filteredData);
			}

			function selectLad(lad) {
				geovis.select(lad);
			}

			// Filter
			var filter = new Filter(d3.select('.filter'));

			filter.addText('Flows [?]', 'Maps show outward and inward movement of people in tech communities [?].');

			filter.addKeyTable(
				'',
				[
					{ type: 'circle', fill: 'rgba(200, 200, 200, .6)', stroke: 'none', r: 5, desc: 'Location' },
					{ type: 'line', color: 'rgba(214, 39, 40, .5)', thickness: 1, desc: 'Weak connection. Probability less than 50% [?]' },
					{ type: 'line', color: 'rgba(214, 39, 40, .5)', thickness: 2, desc: 'Strong connection. Probability more than 50% [?]' },
				]);

			var colorScale = ColorPalette.ordinal(topics).scale;

			filter.addRadioSection(
				'Topics',
				[{ value: '', name: 'topic', label: 'All topics', checked: true }].concat(topics.map(function(l) {
					return {
						value: l,
						label: l,
						name: 'topic',
						color: colorScale(l)
					};
				})),
				function(v) {
					selectedTopic = v;
					ladCallbacks.update(getLadNames());
					redraw();
				}
			);

			var ladCallbacks = filter.addSelectSearchSection(
				'',
				getLadNames(),
				'Search for LAD',
				function(v) {
					selectLad(v);
				});

			geovis.draw();
		});
	});
});
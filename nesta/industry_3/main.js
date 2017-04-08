var width = window.innerWidth,
	height = window.innerHeight;

var svg = d3.select("body").append("svg")
	.classed('vis--geovis', true)
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();


datareader.readData(Datareader.DATASETS.LadsMap, function(lads) {
	datareader.readData(Datareader.DATASETS.Lads, function(ladAreas) {
		datareader.readData(Datareader.DATASETS.LadsEmploymentBusiness, function(ladNames, years, sectors, subsectors, data) {
			data = data.filter(function(d) { return ladAreas[d.lad] == 'Wales'; });
			var selectedYear = years[years.length - 1];
			var selectedSector = 'all';
			var filteredSubsectors = subsectors;
			var selectedSubsector = filteredSubsectors[0].id;

			function prepareData() {
				var filteredData = data.filter(function(d) { return d.year == selectedYear; });
				var extractedData = filteredData.map(function(d) {
					return {
						lad: d.lad,
						x: d.subsectors[selectedSubsector] !== undefined ? d.subsectors[selectedSubsector].business : undefined,
						y: d.subsectors[selectedSubsector] !== undefined ? d.subsectors[selectedSubsector].employment : undefined,
					}
				});
				return extractedData;
			}

			var bivariate = new Bivariate(svg, lads, ladAreas, prepareData(), {
			});

			bivariate.draw();

			function redrawMap() {
				bivariate.redraw(prepareData());
			}

			// Filter
			var filter = new Filter(d3.select('.filter'));
			filter.addRadioSection(
				'Year',
				years.map(function(d, i) { return { label: d, value: d, checked: i == years.length - 1 }; }),
				function(v) {
					selectedYear = v;
					redrawMap();
				});

			filter.addSelectSearchSection(
				'Sector',
				[{ id: 'all', text: 'All' }].concat(sectors.map(function(s) { return { id: s, text: s }; })),
				'',
				function(v) {
					selectedSector = v;
					filteredSubsectors = subsectors.filter(function(d) {
						return selectedSector == 'all' || d.sector == selectedSector;
					});
					selectedSubsector = filteredSubsectors[0];
					updateSelectSubector();
					redrawMap();
				});

			function getSubsectorList() {
				return filteredSubsectors.map(function(l) {
					return {
						id: l.id,
						text: selectedSector == 'all' ? l.sector + ': ' + l.name : l.name
					};
				});
			}

			function updateSelectSubector() {
				subsectorCallbacks.update(getSubsectorList());
			}
			
			var subsectorCallbacks = filter.addSelectSearchSection(
				'Subsector (?)',
				getSubsectorList(),
				'',
				function(v) {
					selectedSubsector = v;
					redrawMap();
				});
		});
	});
});
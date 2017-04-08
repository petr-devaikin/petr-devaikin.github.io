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
			var lastYear = years.pop();

			var selectedYear = years[years.length - 1];
			var selectedSector = 'all';
			var filteredSubsectors = subsectors;
			var selectedSubsector = filteredSubsectors[0].id;

			var lastYearData = {}
			data.filter(function(d) { return d.year == lastYear; }).forEach(function(d) {
				lastYearData[d.lad] = d;
			});

			function prepareData() {
				var filteredData = data.filter(function(d) { return d.year == selectedYear; });
				var extractedData = filteredData.map(function(d) {
					var lastYearLadData = lastYearData[d.lad].subsectors;

					var xValue, yValue;

					if (d.subsectors[selectedSubsector] === undefined || lastYearLadData[selectedSubsector] === undefined ||
						d.subsectors[selectedSubsector].business === undefined || lastYearLadData[selectedSubsector].business === undefined)
						xValue = undefined;
					else
						xValue = lastYearLadData[selectedSubsector].business - d.subsectors[selectedSubsector].business;

					if (d.subsectors[selectedSubsector] === undefined || lastYearLadData[selectedSubsector] === undefined ||
						d.subsectors[selectedSubsector].employment === undefined || lastYearLadData[selectedSubsector].employment === undefined)
						xValue = undefined;
					else
						yValue = lastYearLadData[selectedSubsector].employment - d.subsectors[selectedSubsector].employment;

					return {
						lad: d.lad,
						x: xValue,
						y: yValue,
					}
				});
				return extractedData;
			}

			var bivariate = new Bivariate(svg, lads, ladAreas, prepareData(), {
				labelX: 'Change in bus. n. lq',
				labelY: 'Change in empl. lq',
				valueSymmetry: true
			});

			bivariate.draw();

			function redrawMap() {
				bivariate.redraw(prepareData());
			}

			// Filter
			var filter = new Filter(d3.select('.filter'));
			filter.addRadioSection(
				'Period',
				years.map(function(d, i) { return { label: d + ' – ' + lastYear, value: d, checked: i == years.length - 1 }; }),
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
					selectedSubsector = filteredSubsectors[0].id;
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
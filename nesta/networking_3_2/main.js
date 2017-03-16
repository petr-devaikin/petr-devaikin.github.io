var width = 1700,
	height = 900;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


d3.csv('find_area_from_lad.csv', function(citiesData) {
	var walshCities = [];
	for (var i = 0; i < citiesData.length; i++)
		if (citiesData[i].Areas == 'Wales')
			walshCities.push(citiesData[i].LAD13NM_LGDName);

	d3.csv('normalised_attendants_in_other_cities.csv', function(rawData) {
		var xValues,
			yValues,
			data,
			maxValue = 0;

		var welshCols,
			welshRows;

		function prepareData() {
			xValues = [];
			yValues = [];
			data = [];

			var xValuesName = 'LAD13NM_LGDName';

			var walshCityLastPosition = 0;

			for (var prop in rawData[0])
				if (prop != xValuesName && rawData[0].hasOwnProperty(prop)) 
					if (walshCities.indexOf(prop) == -1)
						yValues.push(prop);
					else
						yValues.splice(walshCityLastPosition++, 0, prop); // put Walch cities to the beginning

			welshRows = walshCityLastPosition;

			// calculate the order of xValues
			var xValuesOrder = [];
			walshCityLastPosition = 0;
			rawData.forEach(function(currentColumn, i) {
				var found = false; // check if the value for any of Walsh cities is more than 0
				for (var j = 0; j < walshCities.length; j++)
					if (currentColumn[walshCities[j]] !== undefined && parseFloat(currentColumn[walshCities[j]]) > 0) {
						found = true;
						break;
					}

				if (found) {
					if (walshCities.indexOf(currentColumn[xValuesName]) == -1)
						xValuesOrder.push(i);
					else
						xValuesOrder.splice(walshCityLastPosition++, 0, i);
				}
			});

			welshCols = walshCityLastPosition;

			for (var i = 0; i < xValuesOrder.length; i++) {
				var currentColumn = rawData[xValuesOrder[i]];
				var currentCityName = currentColumn[xValuesName];
				xValues.push(currentCityName);

				yValues.forEach(function(y, j) {
					if (walshCities.indexOf(currentCityName) != -1 || walshCities.indexOf(y) != -1) {
						if (parseFloat(currentColumn[y]) > 0) {
							data.push({
								value: parseFloat(currentColumn[y]),
								x: currentCityName,
								y: y
							});
							maxValue = Math.max(maxValue, currentColumn[y]);
						}
					}
				});
			}

			// remove extra rows

			var cleanData = [];

			var shift = 0;
			for (var i = 0; i < yValues.length; i++) {
				var filtered = data.filter(function(d) { return d.y == yValues[i] && walshCities.indexOf(d.x) != -1; });
				var sum = filtered.reduce(function(a, b) { return a + b.value; }, 0);
				if (sum == 0) {
					//console.log('remove ' + (i - shift) + ' ' + yValues[i - shift]);
					yValues.splice(i - shift, 1);
					i--;
				}
				else {
					var row = data.filter(function(d) { return d.y == yValues[i]; });
					cleanData = cleanData.concat(row);
				}
			}

			data = cleanData;
		}
		prepareData();

		var heatmap = new Heatmap(svg, xValues, yValues, data, {
			maxValue: maxValue,
			legendRoundTo: 2,
			legendSampleWidth: 25,
			leftMargin: 150,
			bottomMargim: 10,
			topMargin: 150,
			showTopAxis: true,
			showBottomAxis: false,
			minColor: '#ffeda0',
			maxColor: '#f03b20',
			highlightedColumns: welshCols, // <----- FIX THIS
			highlightedRows: welshRows,
			highlightedValues: walshCities,
			sorting: true
		});
		heatmap.draw();
	});
});
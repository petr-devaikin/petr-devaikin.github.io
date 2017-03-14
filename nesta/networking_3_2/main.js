var width = 1700,
	height = 900;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


d3.csv('find_area_from_lad.csv', function(citiesData) {
	var cities = [];
	for (var i = 0; i < citiesData.length; i++)
		if (citiesData[i].Areas == 'Wales')
			cities.push(citiesData[i].LAD13NM_LGDName);

	d3.csv('normalised_attendants_in_other_cities.csv', function(rawData) {
		var xValues,
			yValues,
			data,
			maxValue = 0;

		function prepareData() {
			xValues = [];
			yValues = [];
			data = [];

			var xValuesName = Object.keys(rawData[0])[0];

			for (var prop in rawData[0])
				if (prop != xValuesName && rawData[0].hasOwnProperty(prop)) 
					yValues.push(prop);

			// fix this hell
			/*console.log(yValues);
			yValues.sort(function(a, b) {
				if ((cities.indexOf(a) != -1 && cities.indexOf(b) != -1) || (cities.indexOf(a) == -1 && cities.indexOf(b) == -1)) {
					if (a < b) return -1;
					if (a > b) return 1;
					return 0;
				}
				if (cities.indexOf(a) != -1)
					return -1;
				if (cities.indexOf(b) != -1)
					return 1;
			});
			console.log(yValues);*/

			var xCounter = 0;
			rawData.forEach(function(d, i) {
				var found = false;
				for (var j = 0; j < cities.length; j++) {
					if (d[cities[j]] !== undefined && parseFloat(d[cities[j]]) > 0) {
						found = true;
						break;
					}
				}
				if (found) {
					xValues.push(d[xValuesName]);
					yValues.forEach(function(y, j) {
						//if (cities.indexOf(d[xValuesName]) != -1 || cities.indexOf(y) != -1) {
							data.push({
								value: parseFloat(d[y]),
								x: xCounter,
								y: j
							});
							maxValue = Math.max(maxValue, d[y]);
						//}
					});
					xCounter++;
				}
			});

			// remove extra rows

			var cityYPositions = [];
			for (var j = 0; j < cities.length; j++) {
				var pos = xValues.indexOf(cities[j]);
				if (pos != -1)
					cityYPositions.push(pos);
			}

			var cleanData = [];

			var shift = 0;
			var length = yValues.length;
			for (var i = 0; i < length; i++) {
				var filtered = data.filter(function(d) { return d.y == i && cityYPositions.indexOf(d.x) != -1; });
				var sum = filtered.reduce(function(a, b) { return a + b.value; }, 0);
				if (sum == 0) {
					//console.log('remove ' + (i - shift) + ' ' + yValues[i - shift]);
					yValues.splice(i - shift, 1);
					shift++;
				}
				else if (shift > 0) {
					//console.log('shift ' + i + ' to ' + shift);
					var row = data.filter(function(d) { return d.y == i; })
					row.forEach(function(d) { d.y -= shift; });
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
		});
		heatmap.draw();
	});
});
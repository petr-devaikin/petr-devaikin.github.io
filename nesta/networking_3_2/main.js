var width = 1400,
	height = 1400;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.Lads, function(lads) {
	function isWelsh(city) { return lads[city] == 'Wales'; }

	var welshCities = [];
	Object.keys(lads).forEach(function(l) {
		if (isWelsh(l)) welshCities.push(l);
	});

	datareader.readData(Datareader.DATASETS.Attendants, function(fromCities, toCities, attendants) {
		var maxValue = 0;
		var filteredFrom = welshCities.slice();
		var filteredTo = welshCities.slice();
		var filteredAttendants = [];

		// create a list of cities first
		attendants.forEach(function(a) {
			if (a.value > 0 && (isWelsh(a.to) || isWelsh(a.from))) {
				if (filteredFrom.indexOf(a.from) == -1) filteredFrom.push(a.from);
				if (filteredTo.indexOf(a.to) == -1) filteredTo.push(a.to);
			}
		});
		
		filteredTo.sort();
		filteredFrom.sort();

		// filter data
		attendants.forEach(function(a) {
			if (a.value > 0 && filteredFrom.indexOf(a.from) != -1 && filteredTo.indexOf(a.to) != -1) {
				a.x = a.to;
				a.y = a.from;

				filteredAttendants.push(a);

				maxValue = Math.max(maxValue, a.value);
			}
		});


		var heatmap = new Heatmap(svg, filteredTo, filteredFrom, filteredAttendants, {
			minValue: 1,
			maxValue: maxValue,
			legendRoundTo: 0,
			legendSampleWidth: 35,
			leftMargin: 150,
			bottomMargim: 10,
			topMargin: 150,
			showTopAxis: true,
			showBottomAxis: false,
			highlightedValues: welshCities,
			sorting: true,
			logarythmicValueScale: true,
			legendText: 'Number of attendants ... (?)'
		});
		heatmap.draw();
	})
});
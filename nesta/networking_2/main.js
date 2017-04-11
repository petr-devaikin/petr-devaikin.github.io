var width = 1000,
	height = 600;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.MeetupAttendance, function(years, groups, links) {
	var year1 = 2013,
		year2 = 2016
		selectedVariable = 'events',
		sortBy = 'name';

	var arcchart = new Arcchart(svg, {
		graphWidth: 1000
	});

	function draw() {
		if (sortBy == 'name')
			groups.sort(function(a, b) {
				if (b.name.toLowerCase() > a.name.toLowerCase())
					return -1;
				if (a.name.toLowerCase() > b.name.toLowerCase())
					return 1;
				return 0;
			});
		else
			groups.sort(function(a, b) {
				var aValue, bValue;
				aValue = a.values[year1] === undefined ? 0 : a.values[year1][sortBy];
				aValue += a.values[year2] === undefined ? 0 : a.values[year2][sortBy];
				bValue = b.values[year1] === undefined ? 0 : b.values[year1][sortBy];
				bValue += b.values[year2] === undefined ? 0 : b.values[year2][sortBy];
				return bValue - aValue;
			});

		var allGroups = groups.map(function(d) { return { id: d.name, name: d.name }});

		var leftValues = groups
			.filter(function(d) {
				return d.values[year1] !== undefined && d.values[year1][selectedVariable] > 0;
			})
			.map(function(d) {
				return { id: d.name, value: d.values[year1][selectedVariable] };
			});
		var rightValues = groups
			.filter(function(d) {
				return d.values[year2] !== undefined && d.values[year2][selectedVariable] > 0;
			})
			.map(function(d) {
				return { id: d.name, value: d.values[year2][selectedVariable] };
			});
		var leftLinks = links
			.filter(function(d) {
				return d.year == year1 && d.value > 0;
			})
			.map(function(d) {
				return { itemIds: [d.source, d.target], value: d.value };
			});
		var rightLinks = links
			.filter(function(d) {
				return d.year == year2 && d.value > 0;
			})
			.map(function(d) {
				return { itemIds: [d.source, d.target], value: d.value };
			});

		arcchart.draw(
			allGroups,
			leftValues,
			rightValues,
			leftLinks,
			rightLinks
		);
	}
	draw();


	// Filter
	var filter = new Filter(d3.select('.filter'));

	filter.addRadioSection(
		'Year 1 (left) [!]',
		years.map(function(d, i) { return { label: d, value: d, checked: d == year1 }; }),
		function(v) {
			year1 = v;
			draw();
		}
	);

	filter.addRadioSection(
		'Year 2 (right) [!]',
		years.map(function(d, i) { return { label: d, value: d, checked: d == year2 }; }),
		function(v) {
			year2 = v;
			draw();
		}
	);

	filter.addRadioSection(
		'Sort by',
		[
			{ label: 'Name', value: 'name', checked: true },
			{ label: 'Number of events', value: 'events' },
			{ label: 'Number of attendants', value: 'attendants' },
		],
		function(v) {
			sortBy = v;
			draw();
		}
	);

	filter.addRadioSection(
		'Bubble ares [!]',
		[
			{ label: 'Number of events', value: 'events', checked: true },
			{ label: 'Number of attendants', value: 'attendants' },
		],
		function(v) {
			selectedVariable = v;
			draw();
		}
	);
});
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

	// Process data
	var groupHash = {}
	var maxGroupValue = 0;
	groups.forEach(function(d, i) {
		d.id = i;
		groupHash[d.name] = d;
		maxGroupValue = Math.max(maxGroupValue, d3.max(years, function(year) {
			return d.values[year] !== undefined ? d.values[year][selectedVariable] : 0;
		}));
	});

	var maxLinkValue = 0;
	links.forEach(function(d, i) {
		d.id = [groupHash[d.source].id, groupHash[d.target].id].sort().join('_');
		maxLinkValue = Math.max(maxLinkValue, d.value);
	});

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
				return a.id - b.id;
			});
		else
			groups.sort(function(a, b) {
				var aValue, bValue;
				aValue = a.values[year1] === undefined ? 0 : a.values[year1][sortBy];
				aValue += a.values[year2] === undefined ? 0 : a.values[year2][sortBy];
				bValue = b.values[year1] === undefined ? 0 : b.values[year1][sortBy];
				bValue += b.values[year2] === undefined ? 0 : b.values[year2][sortBy];
				if (aValue != bValue)
					return bValue - aValue;
				else
					return a.id - b.id;
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
				return { itemIds: [d.source, d.target], value: d.value, id: d.id };
			});
		var rightLinks = links
			.filter(function(d) {
				return d.year == year2 && d.value > 0;
			})
			.map(function(d) {
				return { itemIds: [d.source, d.target], value: d.value, id: d.id };
			});

		arcchart.draw(
			allGroups,
			leftValues,
			rightValues,
			leftLinks,
			rightLinks,
			year1,
			year2,
			maxGroupValue,
			maxLinkValue
		);
	}
	draw();


	// Filter
	var filter = new Filter(d3.select('.filter'));

	filter.addDiscreteRangeSlider(
		'Time Period',
		years,
		year1, year2,
		function(v) {
			if (year1 != v[0] || year2 != v[1]) {
				year1 = v[0];
				year2 = v[1];
				draw();
			}
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
		'Bubble area [!]',
		[
			{ label: 'Number of events', value: 'events', checked: true },
			{ label: 'Number of attendants', value: 'attendants' },
		],
		function(v) {
			selectedVariable = v;

			maxGroupValue = 0;
			groups.forEach(function(d, i) {
				d.id = i;
				groupHash[d.name] = d;
				maxGroupValue = Math.max(maxGroupValue, d3.max(years, function(year) {
					return d.values[year] !== undefined ? d.values[year][selectedVariable] : 0;
				}));
			});

			draw();
		}
	);

	d3.select('.filter').append('h4').text('Key [!]');
	d3.select('.filter').append('div').text('[line] - normalised number of attendants');
});
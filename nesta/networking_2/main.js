var width = window.innerWidth - 230,
	height = 750;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.MeetupAttendance, function(years, groups, links) {
	var year1 = 2014,
		year2 = 2016
		selectedVariable = 'events',
		sortBy = 'events',
		groupBy = 'lad';

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
		graphWidth: 1000,
		selectCallback: function(groupId) {
			groupFieldCallbacks.setValue(groupId);
			showMeta(groupId);
		}
	});

	function draw() {
		groups.sort(function(a, b) {
			var aValue, bValue;

			if (groupBy == 'lad' && a.meta.lad != b.meta.lad)
				return a.meta.lad > b.meta.lad ? 1 : -1;
			else if (groupBy == 'topic' && a.meta.topic != b.meta.topic)
				return a.meta.topic > b.meta.topic ? 1 : -1;
			
			aValue = a.values[year1] === undefined ? 0 : a.values[year1][sortBy];
			aValue += a.values[year2] === undefined ? 0 : a.values[year2][sortBy];
			bValue = b.values[year1] === undefined ? 0 : b.values[year1][sortBy];
			bValue += b.values[year2] === undefined ? 0 : b.values[year2][sortBy];

			if (aValue != bValue)
				return bValue - aValue;
			else
				return a.id - b.id;
		});

		var allGroups = groups.map(function(d) { return { id: d.id, name: d.name, desc: d.meta.lad + ' | ' + d.meta.topic }});

		var leftValues = groups
			.filter(function(d) {
				return d.values[year1] !== undefined && d.values[year1][selectedVariable] > 0;
			})
			.map(function(d) {
				return { id: d.id, value: d.values[year1][selectedVariable] };
			});
		var rightValues = groups
			.filter(function(d) {
				return d.values[year2] !== undefined && d.values[year2][selectedVariable] > 0;
			})
			.map(function(d) {
				return { id: d.id, value: d.values[year2][selectedVariable] };
			});
		var leftLinks = links
			.filter(function(d) {
				return d.year == year1 && d.value > 0;
			})
			.map(function(d) {
				return { itemIds: [groupHash[d.source].id, groupHash[d.target].id], value: d.value, id: d.id };
			});
		var rightLinks = links
			.filter(function(d) {
				return d.year == year2 && d.value > 0;
			})
			.map(function(d) {
				return { itemIds: [groupHash[d.source].id, groupHash[d.target].id], value: d.value, id: d.id };
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


	// Filter
	var filter = new Filter(d3.select('.filter'));

	filter.addText('Network', 'The graph shows connections between tech meetup groups in Wales [?].');

	filter.addKeyTable(
		'',
		[
			{ type: 'circle', fill: 'rgba(31, 119, 180, .6)', stroke: 'none', r: 8, desc: 'Activity of a meetup group. Area – number of events or attendants [?].' },
			{ type: 'line', color: '#ccc', thickness: 3, desc: 'Connections [?]. Thickness – [?]' },
		]);

	filter.addRadioSection(
		'Show activity as',
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
		'Group by',
		[
			{ label: 'Location', value: 'lad', checked: true },
			{ label: 'Topic', value: 'topic' },
			{ label: 'None [?]', value: '' },
		],
		function(v) {
			groupBy = v;
			draw();
		}
	);

	filter.addRadioSection(
		'Order by',
		[
			{ label: 'Number of events', value: 'events', checked: true },
			{ label: 'Number of attendants', value: 'attendants' },
		],
		function(v) {
			sortBy = v;
			draw();
		}
	);

	var groupFieldCallbacks = filter.addSelectSearchSection(
		'Meetup Group Info',
		[{ id: '', text: '' }].concat(groups.map(function(d) { return { id: d.id, text: d.name }; })),
		'Select group',
		function(v) {
			if (v == '') v = undefined;
			showMeta(v);
			arcchart.select(v);
		}
	);

	function showMeta(groupId) {
		var selectedGroup = groups.find(function(d) { return d.id == groupId; });
		if (selectedGroup) {
			metaCallback.update('{0}<br/><a href="{1}" target="_blank">More</a>'.format(
				selectedGroup.meta.description,
				selectedGroup.meta.link
			));
			metaCallback.show(true);
		}
		else
			metaCallback.show(false);
	}

	var metaCallback = filter.addText('', '');
	metaCallback.show(false);

	draw();
});
var width = 1000,
	height = 600;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var datareader = new Datareader();

datareader.readData(Datareader.DATASETS.MeetupAttendance, function(years, groups, links) {
	var year1 = 2013,
		year2 = 2016
		selectedVariable = 'events';

	var arcchart = new Arcchart(svg, {
		graphWidth: 1000
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

	function draw() {
		arcchart.draw(
			allGroups,
			leftValues,
			rightValues,
			leftLinks,
			rightLinks
		);
	}
	draw();
});
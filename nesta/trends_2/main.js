var width = 1100,
	height = 900;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


function getFilterValues() {
	return {
		source: d3.select('.m-filters__source').node().value,
	}
}	

function setupFilters() {
	var filters = d3.select('.m-filters');
	filters.selectAll('input,select').on('change', function() {
		loadData();
	});
}
setupFilters();

var xValues = [],
	xValuesMap = {};

function loadData() {
	xValues = [];
	d3.csv(
		getFilterValues().source,
		function(d, i) {
			var propsToIgnore = ['', 'Meetup Tag'];

			if (i == 0) {
				Object.keys(d).forEach(function(prop, j) {
					if (propsToIgnore.indexOf(prop) == -1) {
						var name = prop.split('_').pop();
						xValues.push(name);
						xValuesMap[name] = prop;
					}
				});
				xValues.sort();
			}

			var res = {
				name: d['Meetup Tag'],
				values: []
			}
			xValues.forEach(function(x, j) {
				var prop = xValuesMap[x];
				if (d[prop] !== undefined && d[prop] != '')
					res.values[j] = {
						value: parseFloat(d[prop])
					};
			});
			return res;
		},
		function(lines) {
			// calculate the positions
			xValues.forEach(function(x, i) {
				lines.sort(function(a, b) {
					if (a.values[i] !== undefined && b.values[i] !== undefined) {
						return b.values[i].value - a.values[i].value;
					}
					else if (a.values[i] !== undefined)
						return -1;
					else if (b.values[i] !== undefined)
						return 1;
					else
						return 0;
				});
				lines.forEach(function(d, j) {
					if (d.values[i] !== undefined)
						d.values[i].position = j + 1;
				})
			});

			svg.html('');
			var bumpchart = new Bumpchart(svg, xValues, lines, {
				leftMargin: 150,
				rightMargin: 150,
				bottomMargim: 150,
			});
			bumpchart.draw();

			var searchboxData = lines.map(function(l) { return l.name; });
			searchboxData.sort();
			searchboxData.unshift('');
			$("#searchbox").select2({
				data: searchboxData
			}).change(function() {
				var selectedTopic = $('#searchbox').val();
				bumpchart.select(lines.find(function(l) { return l.name == selectedTopic; }));
			});
		}
	);
}
loadData();
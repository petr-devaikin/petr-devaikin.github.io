var width = 1200,
	height = 700;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();
datareader.readData(Datareader.DATASETS.Contextual, function(lads, data) {
	data = data.filter(function(d) { return d.lad.isWelsh; });

	var xValues = d3.extent(data, function(d) { return d.complexity_norm; });
	var yValues = d3.extent(data, function(d) { return d.salary.median; });
	var rValues = [0, 100];//d3.extent(data, function(d) { return d.employment_rate; });
	var years = d3.extent(data, function(d) { return d.year; });

	data.forEach(function(d) {
		d.x = d.complexity_norm;
		d.y = d.salary.median;
		d.r = d.employment_rate;
	});

	var selectedData = data.filter(function(d) { return d.year == years[1]; });

	var MAX_RADIUS = 10;

	var bubblechart = new Bubblechart(svg, xValues, yValues, rValues, selectedData, {
		graphWidth: 800,
		graphHeight: 400,
		leftMargin: 120,
		useLogXScale: false,
		useLogYScale: false,
		leftLabel: 'Median salary, £',
		bottomLabel: 'Normalised complexity',
		rLabel: 'Employment rate (%)',
		showLegend: false,
		showKey: true,
		maxCircleArea: MAX_RADIUS * MAX_RADIUS,
		addHintContent: function(hint) {
			hint.append('text').classed('vis__hint__lad', true).style('font-weight', 'bold');
			hint.append('text').classed('vis__hint__complexity', true).attr('dy', 15);
			hint.append('text').classed('vis__hint__salary', true).attr('dy', 30);
			hint.append('text').classed('vis__hint__employment', true).attr('dy', 45);
		},
		updateHintContent: function(hint, d) {
			hint.select('.vis__hint__lad').text(d.lad.name);
			hint.select('.vis__hint__complexity').text('Complexity: ' + d.complexity_norm.abbrNum(2));
			hint.select('.vis__hint__salary').text('Median salary: £' + d.salary.median.separate());
			hint.select('.vis__hint__employment').text('Employment: ' + d.employment_rate + '%');
		}
	});


	// filter
	var filter = new Filter(d3.select('.filter'));

	filter.addRadioSection(
		'Year',
		d3.range(years[0], years[1] + 1).map(function(d, i) {
			return {
				value: d,
				label: d,
				checked: d == years[1]
			}
		}),
		function(year) {
			selectedData = data.filter(function(d) { return d.year == year; });
			console.log(year);
			//bubblechart.redraw(data);
		}
	);

	var ladOptions = [{ value: '', label: '' }]
		.concat(Object.keys(lads).map(function(d) { return { value: d, label: lads[d].name }; }));
	var ladSelect = filter.addSelectSearchSection(
		'Local Authority District',
		ladOptions,
		'Select LAD',
		function(ladId) {
			console.log(ladId);
		}
	);

	filter.addBubbleKey('Employment rate, %', 100, MAX_RADIUS, 5);

	bubblechart.draw();
});
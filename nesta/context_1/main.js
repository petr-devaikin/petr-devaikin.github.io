var width = 1200,
	height = 700;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);


var datareader = new Datareader();
datareader.readData(Datareader.DATASETS.Contextual, function(lads, data) {
	var dimensions = [
		{ value: 'complexity_norm', label: 'Normalised complexity' },
		{ value: 'employment_rate', label: 'Employment rate' },
		{ value: 'inactive', label: '% of econom. inactive' },
		{ value: 'economic_activity_rate', label: 'Economic activity rate' },
		{ value: 'nvq1', label: '% with NVQ1' },
		{ value: 'nvq2', label: '% with NVQ2' },
		{ value: 'nvq3', label: '% with NVQ3' },
		{ value: 'nvq4', label: '% with NVQ4' },
		{ value: 'salary_median', label: 'Median salary' },
		{ value: 'salary_10', label: 'Salary 10 percentile' },
		{ value: 'salary_30', label: 'Salary 30 percentile' },
		{ value: 'salary_75', label: 'Salary 75 percentile' },
		{ value: 'p70_to_p20', label: '70 percentile vs 20 percentile' },
	];

	var bubblechart;

	var xDimension = 'complexity_norm';
	var xLabel = 'Normalised complexity';
	var yDimension = 'p70_to_p20';
	var yLabel = '70 percentile vs 20 percentile';
	var rDimension = 'inactive';
	var rLabel = '% of econom. inactive';
	var years = d3.extent(data, function(d) { return d.year; });

	var xValues,
		yValues,
		rValues;

	function prepareData() {
		data.forEach(function(d) {
			d.id = d.lad.code;
			d.x = d[xDimension];
			d.y = d[yDimension];
			d.r = d[rDimension];
			d.category = d.lad.isWelsh ? 'Wales' : 'UK';
		});
		xValues = d3.extent(data, function(d) { return d.x });
		yValues = d3.extent(data, function(d) { return d.y });
		rValues = d3.extent(data, function(d) { return d.r });
		console.log(rValues);
	}

	function draw() {
		prepareData();

		var selectedData = data.filter(function(d) { return d.year == years[1]; });

		var MAX_RADIUS = 10;

		bubblechart = new Bubblechart(svg, xValues, yValues, rValues, selectedData, {
			graphWidth: 800,
			graphHeight: 400,
			leftMargin: 120,
			useLogXScale: false,
			useLogYScale: false,
			leftLabel: yLabel,
			bottomLabel: xLabel,
			rLabel: rLabel,
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
				hint.select('.vis__hint__complexity').text(xLabel + ': ' + d.x.abbrNum(2));
				hint.select('.vis__hint__salary').text(yLabel + ': ' + d.y.abbrNum(2));
				hint.select('.vis__hint__employment').text(rLabel + ': ' + d.r.abbrNum(2));
			},
			categories: ['Wales', 'UK'],
			selectedCategory: 'Wales',
		});

		bubblechart.draw();
	}


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
			bubblechart.redraw(selectedData);
		}
	);

	filter.addRadioSection(
		'X',
		dimensions.map(function(d) { return { value: d.value, label: d.label, checked: d.value == xDimension }; }),
		function(v) {
			xDimension = v;
			xLabel = dimensions.find(function(d) { return d.value == v; }).label;
			console.log(v);
			draw();
		}
	);

	filter.addRadioSection(
		'Y',
		dimensions.map(function(d) { return { value: d.value, label: d.label, checked: d.value == yDimension }; }),
		function(v) {
			yDimension = v;
			yLabel = dimensions.find(function(d) { return d.value == v; }).label;
			console.log(v);
			draw();
		}
	);

	filter.addRadioSection(
		'Area',
		dimensions.slice(1).map(function(d) { return { value: d.value, label: d.label, checked: d.value == rDimension }; }),
		function(v) {
			rDimension = v;
			rLabel = dimensions.find(function(d) { return d.value == v; }).label;
			console.log(v);
			draw();
		}
	);

	//filter.addBubbleKey('Employment rate, %', 100, MAX_RADIUS, 5);

	draw();
});
function Barchart(svg, p) {
	var params = {
		topMargin: 50,
		graphWidth: 600,
		itemWidth: 100,
		itemHeight: 20,
		pointMaxRadius: 40,
		arcMaxThickness: 5,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var graphArea,
		itemsArea,
		leftPartArea,
		rightPartArea,
		leftPointsArea,
		rightPointsArea,
		leftArcsArea,
		rightArcsArea;

	var yScale,
		rScale,
		arcScale;


	function init() {
		svg.html('');
		svg.classed('vis--arc', true);

		// Areas

		graphArea = svg.append('g')
			.classed('vis__graph', true)
			.attr('transform', 'translate({0},{1})'.format(params.graphWidth / 2, params.topMargin));

		leftPartArea = graphArea.append('g')
			.attr('class', 'vis__graph__values vis__graph__values--left')
			.attr('transform', 'translate({0},{1})'.format(-params.itemWidth / 2, 0));

		rightPartArea = graphArea.append('g')
			.attr('class', 'vis__graph__values vis__graph__values--right')
			.attr('transform', 'translate({0},{1})'.format(params.itemWidth / 2, 0));

		itemsArea = graphArea.append('g')
			.classed('vis__graph__items', true);

		leftPointsArea = leftPartArea.append('g')
			.classed('vis__graph__values__points', true);

		rightPointsArea = rightPartArea.append('g')
			.classed('vis__graph__values__points', true);

		leftArcsArea = leftPartArea.append('g')
			.classed('vis__graph__values__points', true);

		rightArcsArea = rightPartArea.append('g')
			.classed('vis__graph__values__points', true);

		// Scale

		yScale = d3.scaleOrdinal();
		rScale = d3.scaleSqrt().range([0, params.pointMaxRadius]);
		arcScale = d3.scaleLinear().range([0, params.arcMaxThickness]);
	}
	init();

	this.draw = function(items, leftValues, rightValues, leftConnections, rightConnections) {
		// Update scales
		yScale
			.domain(items.map(function(d) { return d.id; }))
			.range(items.map(function(d, i) { return i * params.itemHeight; }));

		var maxValue = Math.max(
			d3.max(leftValues, function(d) { return d.value; }),
			d3.max(rightValues, function(d) { return d.value; }),
		);
		rScale.domain([0, d3.max()])

		// draw items
		function positionItems(selection) {
			// do animated transition!
			selection.attr('transform', function(d, i) {
				return 'translate({0},{1})'.format(0, yScale(i));
			});
		}

		var items = itemsArea.selectAll('.vis__graph__items__item').data(items, function(d) { return d.id; });
		var newItems = items.enter().append('text')
			.classed('vis__graph__items__item', true)
			.text(function(d) { return d.name; })
			.on('mouseover', hoverItem)
			.on('mouseover', outItem)
			.on('click', selectItem);
		items.exit().remove();

		items.call(positionItems);
		newItems.call(positionItems);

		// draw points
		function updatePoints(selection) {
			selection.attr('r', function(d) { return rScale(d.value); });
		}

		function bindPoints(area, data) {
			var points = area.selectAll('.vis__graph__values__points').data(data, function(d) { return d.id; });
			var newPoints = points.enter().append('circle')
				.classed('vis__graph__values__points', true)
				.on('mouseover', hoverItem)
				.on('mouseover', outItem)
				.on('click', selectItem);
			points.exit().remove();

			points.call(updatePoints);
			newPoints.call(updatePoints);
		}

		bindPoints(leftPointsArea, leftValues);
		bindPoints(rightPointsArea, rightValues);

		// draw arcs
	}

	// Interaction

	function hoverItem(d) {

	}

	function outItem(d) {

	}

	function hoverArc(d) {

	}

	function outArc(d) {

	}

	function selectItem(d) {

	}
}

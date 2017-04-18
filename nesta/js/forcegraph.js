function Forcegraph(svg, nodeData, linkData, categories, p) {
	var params = {
		margin: 50,
		forceMaxDistance: 100,
		maxRadius: 7,
		buttonSize: 40,
		addHint: undefined,
		showHint: undefined,
		selectNodeCallback: undefined,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var width = svg.node().getBoundingClientRect().width;
	var height = svg.node().getBoundingClientRect().height;

	var selectedNode;
	var selectedNeighbors = [];

	var graph,
		linkArea,
		nodeArea,
		controlsArea,
		hint;

	var loader;

	var simulation;

	var rScale,
		colorScale;
		//opacityScale;

	var nodes,
		links;

	var zoom,
		initTransform;

	var zoomInButton,
		zoomOutButton,
		zoomInitButton;

	function init() {
		svg.html('');
		svg.classed('vis--forcegraph', true);

		// Loader
		loader = svg.append('text')
			.classed('vis__loader', true)
			.attr('transform', 'translate({0},{1})'.format(width / 2, height / 2))
			.text('Building network 0%');

		// graph
		graph = svg.append('g').classed('vis__graph', true);

		linkArea = graph.append("g").attr("class", "vis__graph__links");
		nodeArea = graph.append("g").attr("class", "vis__graph__nodes");

		// controls

		controlsArea = svg.append('g').attr('class', 'vis__controls')
			.attr('transform', 'translate({0},{1})'.format(10, height - params.buttonSize - 10))
			.attr('visibility', 'hidden');

		function addButton(text, i) {
			var button = controlsArea.append('g')
				.classed('vis__controls__button', true)
				.attr('transform', 'translate({0},{1})'.format((params.buttonSize + 10) * i, 0));
			button.append('rect').classed('vis__controls__button__bg', true)
				.attr('width', params.buttonSize)
				.attr('height', params.buttonSize);
			button.append('text')
				.attr('transform', 'translate({0},{1})'.format(params.buttonSize / 2, params.buttonSize / 2))
				.text(text);
			return button;
		}

		zoomInButton = addButton('+', 0);
		zoomOutButton = addButton('-', 1);
		zoomInitButton = addButton('Auto', 2);

		// hint
		hint = svg.append('g').classed('vis__hint', true);

		if (params.addHint !== undefined)
			params.addHint(hint);

		// scales
		var maxRadius = d3.max(nodeData, function(d) { return d.value; });
		rScale = d3.scaleSqrt().domain([0, maxRadius]).range([0, params.maxRadius]);
		colorScale = d3.scaleOrdinal()
			.domain(categories)
			.range(categories.map(function(d, i) { return d3.interpolateRainbow(i / categories.length); }));
		//opacityScale = d3.scaleLinear().domain([0, 1]).range([0, 1]);

		// simulation
		simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.id; }))
			.force("charge", d3.forceManyBody().distanceMax(params.forceMaxDistance))
			.force("center", d3.forceCenter(0, 0));
	}
	init();

	function updateNodes() {
		nodes
			.classed('muted', function(d) { return d.muted; })
				.select(".vis__graph__nodes__node__circle")
				.attr("r", function(d) { return rScale(d.value); })
				.attr('fill', function(d) {
					var color = colorScale(d.category);
					if (d.opacity === undefined || d.muted)
						return color;
					else
						return d3.interpolate('#fff', color)(d.opacity);
				});
	}

	function updateLinks() {
		links
			.attr("stroke-width", function(d) { return d.value; })
			.classed('muted', function(d) { return d.source.muted || d.target.muted; });
	}

	this.draw = function() {
		links = linkArea.selectAll(".vis__graph__links__link").data(linkData).enter().append("line")
			.classed('vis__graph__links__link', true)
			.attr('visibility', 'hidden');

		updateLinks();

		nodes = nodeArea.selectAll(".vis__graph__nodes__node").data(nodeData).enter().append('g')
			.classed('vis__graph__nodes__node', true)
			.attr('visibility', 'hidden')
			.on('mouseover', nodeHover)
			.on('mouseout', nodeOut)
			.on('click', function(d) { d3.event.stopPropagation(); selectNode(d); });

		nodes.append('circle').classed('vis__graph__nodes__node__bg', true)
			.attr('r', 4);
		nodes.append('circle').classed('vis__graph__nodes__node__circle', true);
		updateNodes();

      	simulation
			.nodes(nodeData)
			.on("tick", tick)
			.on("end", drawGraph);

		simulation.force("link")
			.links(linkData);

		function tick() {
			loader.text('Building network ' + Math.round(100 - simulation.alpha() * 100) + '%');
		}

		function drawGraph() {
			// prepare
			loader.attr('visibility', 'hidden');
			links
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; })
				.attr('visibility', 'visible');
			nodes.attr('visibility', 'visible');
			controlsArea.attr('visibility', 'visible');

			// calculate auto zoom
			var bbox = { x: Infinity, y: Infinity, width: 0, height: 0 }

			nodeData.forEach(function(n) {
				bbox.x = Math.min(bbox.x, n.x);
				bbox.y = Math.min(bbox.y, n.y);
				bbox.width = Math.max(bbox.width, n.x);
				bbox.height = Math.max(bbox.height, n.y);
			});
			bbox.width -= bbox.x;
			bbox.height -= bbox.y;

			var dx, dy, z;
			if ((width - 2 * params.margin) / (height - 2 * params.margin) > bbox.width / bbox.height) {
				console.log('Adjust by height');
				dx = - bbox.width / 2 - bbox.x + width / 2;
				dy = - bbox.height / 2 - bbox.y + height / 2;
				z = (height - 2 * params.margin) / bbox.height;
			}
			else {
				console.log('Adjust by width');
				dx = - bbox.width / 2 - bbox.x + width / 2;
				dy = - bbox.height / 2 - bbox.y + height / 2;
				z = (width - 2 * params.margin) / bbox.width;
			}

			// set zoom
			var scale0 = z;

			initTransform = d3.zoomIdentity.translate(dx, dy).scale(scale0);
			transform = d3.zoomIdentity.translate(dx, dy).scale(scale0);

			zoom = d3.zoom()
				.scaleExtent([0.5 * scale0, 3 * scale0])
				.on("zoom", zoomed);

			svg.call(zoom.transform, transform);
			svg.call(zoom).on('dblclick.zoom', null);
		}


		function zoomed() {
			transform = d3.event.transform;

			linkArea.attr('transform', 'translate({0},{1}) scale({2})'.format(transform.x, transform.y, transform.k));

			nodes
				.attr('transform', function(d) {
					var coords = transform.apply([d.x, d.y]);
					return 'translate({0},{1})'.format(coords[0], coords[1]);
				});
		}
	}

	this.repaint = function(values) {
		if (values !== undefined)
			var maxValue = d3.max(Object.keys(values).map(function(d) { return values[d]; }));

		nodeData.forEach(function(d) {
			if (values === undefined) {
				d.opacity = 1;
				d.muted = false;
			}
			else if (values[d.id] !== undefined) {
				d.opacity = values[d.id] / maxValue;
				d.muted = false;
			}
			else {
				d.opacity = 0;
				d.muted = true;
			}
		});

		updateNodes();
		updateLinks();
	}

	this.select = function(nodeId) {
		if (nodeId === undefined || nodeId == '')
			selectNode();
		else
			selectNode(nodeData.find(function(d) { return d.id == nodeId; }));
	}

	// Interaction

	function selectNode(d) {
		selectedNode = d;

		if (selectedNode !== undefined) {
			nodeData.forEach(function(dd) { dd.selected = false; });
			linkData.forEach(function(dd) {
				if ((dd.target == d || dd.source == d) && !dd.target.muted && !dd.source.muted) {
					dd.selected = true;
					dd.target.selected = true;
					dd.source.selected = true;
				}
				else
					dd.selected = false;
			});

			links
				.classed('blured', function(dd) { return !dd.selected; })
				.classed('selected', function(dd) { return dd.selected; });

			nodes
				.classed('blured', function(dd) { return !dd.selected; })
				.classed('selected', function(dd) { return dd.selected; });
		}
		else {
			links
				.classed('blured', false)
				.classed('selected', false);

			nodes
				.classed('blured', false)
				.classed('selected', false);
		}

		if (params.selectNodeCallback !== undefined)
			params.selectNodeCallback(d !== undefined ? d.id : '');
	}

	function nodeHover(d) {
		var transform = d3.zoomTransform(svg.node());

		var nodePosition = transform.apply([d.x, d.y]);

		var rect = hint.select('rect')
				.attr('x', 0).attr('y', 0)
				.attr('width', 0).attr('height', 0);

		if (params.showHint !== undefined)
			params.showHint(hint, d);

		var hintBBox = hint.node().getBBox();

		rect.attr('x', hintBBox.x - 2).attr('y', hintBBox.y - 2)
			.attr('width', hintBBox.width + 4).attr('height', hintBBox.height + 4);

		hint.attr('transform', 'translate({0},{1})'.format(
			nodePosition[0] - hintBBox.width / 2,
			nodePosition[1] - rScale(d.value) - hintBBox.height
		));

		hint.attr('visibility', 'visible');
	}

	function nodeOut() {
		hint.attr('visibility', 'hidden');
	}

	svg.on("click", function() {
		console.log('reset selection');

		selectNode();

		nodeOut();
	});

	// buttons

	zoomInButton
		.on('click', function() {
			event.stopPropagation();
			zoom.scaleBy(svg, 1.1);
		});

	zoomOutButton
		.on('click', function() {
			event.stopPropagation();
			zoom.scaleBy(svg, .9);
		});

	zoomInitButton
		.on('click', function() {
			event.stopPropagation();
			transform = initTransform;
			svg.call(zoom.transform, transform);
		});
};
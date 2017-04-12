function Forcegraph(svg, nodeData, linkData, categories, p) {
	var params = {
		margin: 50,
		forceMaxDistance: 100,
		minRadius: 1,
		maxRadius: 5,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var width = svg.node().getBoundingClientRect().width;
	var height = svg.node().getBoundingClientRect().height;

	var selectedNode;
	var selectedNeighbors = [];

	var graph,
		linkArea,
		nodeArea,
		hint;

	var loader;

	var simulation;

	var rScale,
		colorScale;

	var nodes,
		links;

	var zoom;

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

		hint = svg.append('g').classed('vis__hint', true);

		// scales
		rScale = d3.scaleSqrt().domain([0, 1]).range([params.minRadius, params.maxRadius]);
		colorScale = d3.scaleOrdinal()
			.domain(categories)
			.range(categories.map(function(d, i) { return d3.interpolateRainbow(i / categories.length); }));

		// simulation
		simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.id; }))
			.force("charge", d3.forceManyBody().distanceMax(params.forceMaxDistance))
			.force("center", d3.forceCenter(0, 0));
	}
	init();

	this.draw = function() {
		links = linkArea.selectAll("line").data(linkData).enter().append("line")
			.attr('visibility', 'hidden')
			.attr("stroke-width", function(d) { return Math.sqrt(d.value); });

		nodes = nodeArea.selectAll("vis__graph__nodes__node").data(nodeData).enter().append('g')
			.classed('vis__graph__nodes__node', true)
			.attr('visibility', 'hidden');

		nodes.append("circle")
			.attr("r", function(d) { return rScale(d.value); })
			.attr('fill', function(d) {
				if (d.category === undefined)
					return '#000';
				else
					return colorScale(d.category);
			});
			//.on('mouseover', nodeHover)
			//.on('mouseout', nodeOut)
			//.on('click', selectNode);

		/*var labels = titles.selectAll('.vis__titles__label').data(nodes).enter().append('g')
			.classed('vis__titles__label', true);

		labels.each(function(d, i) {
			var rect = d3.select(this).append('rect');
			var text = d3.select(this).append('text')
				.attr('dy', -15)
				.text(function(d) { return d.name; });
			var bbox = text.node().getBBox();
			rect
				.attr('x', bbox.x - 2)
				.attr('y', bbox.y - 2)
				.attr('width', bbox.width + 4)
				.attr('height', bbox.height + 4);
		});*/

		function selectNode(d) {
			d3.event.stopPropagation();

			selectedNode = d;
			selectedNeighbors = [];

			node.classed('selected', false);
	        link.classed('selected', false);

			d3.select(this).classed('selected', true);

			link.each(function(l) {
				if (l.source.id == d.id || l.target.id == d.id) {
					d3.select(this).classed('blured', false).classed('selected', true);
					if (selectedNeighbors.indexOf(l.source.id) == -1) selectedNeighbors.push(l.source.id);
					if (selectedNeighbors.indexOf(l.target.id) == -1) selectedNeighbors.push(l.target.id);
				}
			});

			node
				.classed('blured', function(n) { return selectedNeighbors.indexOf(n.id) == -1; })
				.classed('selected', function(n) { return selectedNeighbors.indexOf(n.id) != -1; });

			//labels
			//	.classed('selected', function(n) { return selectedNeighbors.indexOf(n.id) != -1; });

			nodeHover(d);
		}

		function nodeHover(d) {

			link.classed('blured', true);
			node
				.classed('blured', function(dd) { return dd != d; })
				.classed('highlighted', function(dd) { return dd == d; });
			/*
			link.each(function(l) {
				if (l.source == d || l.target == d) {
					d3.select(this).classed('blured', false).classed('highlighted', true);
					if (highlightedNodes.indexOf(l.source) == -1) highlightedNodes.push(l.sourse);
					if (highlightedNodes.indexOf(l.target) == -1) highlightedNodes.push(l.target);
				}
			});

			node
				.classed('blured', function(n) { return highlightedNodes.indexOf(n) == -1; })
				.classed('highlighted', function(n) { return highlightedNodes.indexOf(n) != -1; });*/

			/*labels
				.style('visibility', function(dd, i) {
					if (dd == d || dd == selectedNode)
						return 'visible';
					else
						return 'hidden';
				});*/
		}

		function nodeOut() {
			node
				.classed('highlighted', false)
				.classed('blured', function(d) {
					if (selectedNode !== undefined)
						return !d3.select(this).classed('selected');
					else
						return false;
				});
			link
				.classed('highlighted', false)
				.classed('blured', function(d) {
					if (selectedNode === undefined)
						return false;
					else
						return d.source.id == selectedNode.id || d.target.id == selectedNode.id;
				});

			/*
			labels
				.style('visibility', function(dd, i) {
					if ((d3.select(this).classed('default') && selectedNode === undefined) || dd == selectedNode)
						return 'visible';
					else
						return 'hidden';
				});
			*/
		}

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
			// set zoom
			var scale0 = 1;
			var t = d3.zoomIdentity.translate(0, 0).scale(scale0);

			zoom = d3.zoom()
				.scaleExtent([0.5 * scale0, 3 * scale0])
				.on("zoom", zoomed);

			// prepare
			loader.attr('visibility', 'hidden');
			links.attr('visibility', 'visible');
			nodes.attr('visibility', 'visible');

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

			zoom.translateBy(svg, dx, dy);
			zoom.scaleBy(svg, z);
			zoom(svg);
		}


		function zoomed() {
			var transform = d3.event.transform;

			links
				.attr("x1", function(d, i) { return transform.apply([d.source.x, d.source.y])[0]; })
				.attr("y1", function(d) { return transform.apply([d.source.x, d.source.y])[1]; })
				.attr("x2", function(d) { return transform.apply([d.target.x, d.target.y])[0]; })
				.attr("y2", function(d) { return transform.apply([d.target.x, d.target.y])[1]; });

			nodes
				.attr('transform', function(d) {
					var coords = transform.apply([d.x, d.y]);
					return 'translate({0},{1})'.format(coords[0], coords[1]);
				});

			/*
			labels
				.attr('transform', function(d) {
					var coords = transform.apply([d.x, d.y]);
					return 'translate({0},{1})'.format(coords[0], coords[1]);
				});
				*/
		}

		svg.on("click", function() {
			console.log('reset selection');

			selectedNode = undefined;
			selectedNeighbors = [];

			node.classed('selected', false);
			link.classed('selected', false);

			nodeOut();
		});
	}

};
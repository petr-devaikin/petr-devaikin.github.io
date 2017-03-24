function Forcegraph(svg, nodes, links, p) {
	var params = {
		margin: 50,
		forceMaxDistance: 100,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var width = svg.node().getBoundingClientRect().width;
	var height = svg.node().getBoundingClientRect().height;

	this.draw = function() {
		svg.html('');
		svg.classed('vis--force', true);

		var loader = svg.append('text')
			.classed('vis__loader', true)
			.attr('transform', 'translate({0},{1})'.format(width / 2, height / 2))
			.text('Loading 0%');

		var graph = svg.append('g').classed('vis__graph', true);

		var simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.id; }))
			.force("charge", d3.forceManyBody().distanceMax(params.forceMaxDistance))
			.force("center", d3.forceCenter(0, 0));

		var link = graph.append("g")
			.attr("class", "vis__graph__links")
			.selectAll("line")
			.data(links)
				.enter().append("line")
				.attr('visibility', 'hidden')
				.attr("stroke-width", function(d) { return Math.sqrt(d.value); });

		var node = graph.append("g")
			.attr("class", "vis__graph__nodes")
			.selectAll("vis__graph__nodes__node")
			.data(nodes)
			.enter().append('g')
				.classed('vis__graph__nodes__node', true)
				.attr('visibility', 'hidden');

		node.append("circle")
			.attr("r", 5)
			.on('mouseover', nodeHover)
			.on('mouseout', nodeOut);

		node.append('text')
			.text(function(d) { return d.name; })
			.attr('dy', -5);

		function nodeHover(d) {
			var highlightedNodes = [];

			link.classed('blured', true);
			link.each(function(l) {
				if (l.source == d || l.target == d) {
					d3.select(this).classed('blured', false).classed('highlighted', true);
					if (highlightedNodes.indexOf(l.source) == -1) highlightedNodes.push(l.sourse);
					if (highlightedNodes.indexOf(l.target) == -1) highlightedNodes.push(l.target);
				}
			});

			node
				.classed('blured', function(n) { return highlightedNodes.indexOf(n) == -1; })
				.classed('highlighted', function(n) { return highlightedNodes.indexOf(n) != -1; });
		}

		function nodeOut() {
			node
				.classed('highlighted', false)
				.classed('blured', false);
			link
				.classed('highlighted', false)
				.classed('blured', false);
		}

      	simulation
			.nodes(nodes)
			.on("tick", tick)
			.on("end", drawGraph);

		simulation.force("link")
			.links(links);

		function tick() {
			loader.text('Loading ' + Math.round(100 - simulation.alpha() * 100) + '%');
		}

		function drawGraph() {
			loader.attr('visibility', 'hidden');
			link.attr('visibility', 'visible');
			node.attr('visibility', 'visible');

			// calculate auto zoom
			var bbox = { x: Infinity, y: Infinity, width: 0, height: 0 }

			nodes.forEach(function(n) {
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
		}


		var scale0 = 1;
		var t = d3.zoomIdentity.translate(0, 0).scale(scale0);

		var zoom = d3.zoom()
			.scaleExtent([0.5 * scale0, 3 * scale0])
			.on("zoom", zoomed);

		svg.call(zoom.transform, t);
		svg.call(zoom);

		function zoomed() {
			var transform = d3.event.transform;

			link
				.attr("x1", function(d, i) { return transform.apply([d.source.x, d.source.y])[0]; })
				.attr("y1", function(d) { return transform.apply([d.source.x, d.source.y])[1]; })
				.attr("x2", function(d) { return transform.apply([d.target.x, d.target.y])[0]; })
				.attr("y2", function(d) { return transform.apply([d.target.x, d.target.y])[1]; });

			node
				.attr('transform', function(d) {
					var coords = transform.apply([d.x, d.y]);
					return 'translate({0},{1})'.format(coords[0], coords[1]);
				});
		}
	}

};
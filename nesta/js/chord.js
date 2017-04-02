function Chord(svg, nodes, links1, links2, p) {
	var params = {
		radius: 200,
		margin: 100,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var chord1, chord2;

	this.draw = function() {
		chord1 = svg.append('g')
			.classed('vis__chord', true)
			.attr('transform', 'translate({0},{1})'.format(params.margin + params.radius, params.margin + params.radius));

		chord2 = svg.append('g')
			.classed('vis__chord', true)
			.attr('transform', 'translate({0},{1})'.format(3 * (params.margin + params.radius), params.margin + params.radius));

		var angleStep = 360 / nodes.length;

		// prepare data
		nodes.sort(function(a, b) {
			return a.name.localeCompare(b.name);
		})

		var nodeHash = {};
		nodes.forEach(function(n, i) {
			n.angle = i * angleStep;
			n.left = i >= nodes.length / 2;
			n.links = [];
			nodeHash[n.id] = n;
		});

		
		links1.forEach(function(l) {
			l.sourceNode = nodeHash[l.source];
			l.targetNode = nodeHash[l.target];

			l.old = true;
			l.new = false;

			l.sourceNode.links.push(l);
			l.targetNode.links.push(l);
		});
		//console.log(links1.length);
		links2.forEach(function(l) {
			l.sourceNode = nodeHash[l.source];
			l.targetNode = nodeHash[l.target];

			l.old = false;
			var l1 = links1.filter(function(d) {
				return (d.source == l.source && d.target == l.target) ||
					(d.source == l.target && d.target == l.source);
			});
			console.log(l1);
			if (l1 !== undefined) {
				//console.log('not old!');
				l1.old = false;
				l.new = false;
			}
			else {
				//console.log('new!')
				l.new = true;
			}

			l.sourceNode.links.push(l);
			l.targetNode.links.push(l);
		});
		//console.log(links1.filter(function(d) { return d.old; }).length);

		function drawChord(chord, nodes, links) {
			// labels
			var labelsContainer = chord.append('g').classed('vis__chord__labels', true);
			labelsContainer.selectAll('.vis__chord__labels__label').data(nodes).enter()
				.append('text')
					.classed('vis__chord__labels__label', true)
					.classed('vis__chord__labels__label--left', function(d, i) {
						return i >= nodes.length / 2;
					})
					.attr('transform', function(d, i) {
						var a = !d.left ? d.angle - 90 : d.angle + 90;
						var x = params.radius * Math.sin(d.angle / 180 * Math.PI);
						var y = - params.radius * Math.cos(d.angle / 180 * Math.PI);
						return 'translate({0},{1}) rotate({2})'.format(x, y, a);
					})
					.text(function(d) { return d.name; })
					.on('mouseover', overNode)
					.on('mouseout', outNode);

			// ribbons
			var ribbonsContainer = chord.append('g').classed('vis__chord__ribbons', true);
			var ribbon = d3.ribbon().radius(params.radius);

			ribbonsContainer.selectAll('.vis__chord__ribbons__line').data(links).enter()
				.append('path')
					.classed('vis__chord__ribbons__line', true)
					.classed('old', function(d) { return d.old; })
					.classed('new', function(d) { return d.new; })
					.attr('d', function(d) {
						return ribbon({
							source: {
								startAngle: d.sourceNode.angle / 180 * Math.PI,
								endAngle: d.sourceNode.angle / 180 * Math.PI
							},
							target: {
								startAngle: d.targetNode.angle / 180 * Math.PI,
								endAngle: d.targetNode.angle / 180 * Math.PI
							}
						});
					})

		}
		drawChord(chord1, nodes, links1);
		drawChord(chord2, nodes, links2);

		function overNode(d) {
			d3.selectAll('.vis__chord__labels__label')
				.classed('selected', function(dd) {
					return d == dd;
				})
				/*.classed('highlighted', function(dd) {
					return d.neighbors.indexOf(dd) != -1;
				})
				.classed('blured', function(dd) {
					return d != dd && d.neighbors.indexOf(dd) == -1;
				});*/

			chord1.selectAll('.vis__chord__ribbons__line')
				.classed('selected', function(dd) {
					return d.links.indexOf(dd) != -1;
				});
		}

		function outNode(d) {
			d3.selectAll('.vis__chord__labels__label')
				.classed('selected', false)
				.classed('highlighted', false)
				.classed('blured', false);
			d3.selectAll('.vis__chord__ribbons__line')
				.classed('selected', false)
				.classed('blured', false);
		}
	}
}
function Chord(svg, nodes, links1, links2, p) {
	var params = {
		radius: 200,
		margin: 100,
		title1: '',
		title2: '',
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
			n.links1 = [];
			n.links2 = [];
			nodeHash[n.id] = n;
		});

		
		links1.forEach(function(l) {
			l.sourceNode = nodeHash[l.source];
			l.targetNode = nodeHash[l.target];

			l.old = true;
			l.new = false;

			l.sourceNode.links1.push(l);
			l.targetNode.links1.push(l);
		});
		//console.log(links1.length);
		links2.forEach(function(l) {
			l.sourceNode = nodeHash[l.source];
			l.targetNode = nodeHash[l.target];

			l.old = false;
			var l1 = links1.find(function(d) {
				return (d.source == l.source && d.target == l.target) ||
					(d.source == l.target && d.target == l.source);
			});
			if (l1 !== undefined) {
				//console.log('not old!');
				l1.old = false;
				l.new = false;
			}
			else {
				//console.log('new!');
				l.new = true;
			}

			l.sourceNode.links2.push(l);
			l.targetNode.links2.push(l);
		});
		//console.log(links1.filter(function(d) { return d.old; }).length);

		function drawChord(chord, nodes, links, title) {
			// labels
			var labelsContainer = chord.append('g').classed('vis__chord__labels', true);
			labelsContainer.selectAll('.vis__chord__labels__label').data(nodes).enter()
				.append('text')
					.classed('vis__chord__labels__label', true)
					.classed('vis__chord__labels__label--left', function(d, i) { return d.left; })
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
					});

			chord.append('text')
				.text(title)
				.classed('vis__chord__title', true)
				.attr('transform', 'translate({0},{1})'.format(0, -params.radius - params.margin + 20));

		}
		drawChord(chord1, nodes, links1, params.title1);
		drawChord(chord2, nodes, links2, params.title2);

		/*
		function drawLegend() {
			var legend = svg.append('g')
				.classed('vis__legend', true)
				.attr('transform', 'translate({0},{1})'.format(2 * (params.margin + params.radius), 0));

			legend.append('line')
				.classed('vis__legend__same', true)
				.attr('x1', 0).attr('y1', 5)
				.attr('x2', 10).attr('y2', 5);


			legend.append('line')
				.classed('vis__legend__new', true)
				.attr('x1', 0).attr('y1', 5)
				.attr('x2', 10).attr('y2', 5);
		}
		*/

		function overNode(d) {
			var newConnectionNodes = [];
			var oldConnectionNodes = [];
			var sameConnectionNodes = [];

			d.links1.forEach(function(l) {
				var otherNode = l.sourceNode == d ? l.targetNode : l.sourceNode;

				if (l.old) oldConnectionNodes.push(otherNode);
				else sameConnectionNodes.push(otherNode);
			});

			d.links2.forEach(function(l) {
				var otherNode = l.sourceNode == d ? l.targetNode : l.sourceNode;

				if (l.new) newConnectionNodes.push(otherNode);
			});

			chord1.selectAll('.vis__chord__labels__label')
				.attr('class', function(dd) {
					var res = 'vis__chord__labels__label';
					if (dd.left) res += ' vis__chord__labels__label--left';

					if (d == dd) res += ' selected';
					else if (oldConnectionNodes.indexOf(dd) != -1) res += ' old';
					else if (sameConnectionNodes.indexOf(dd) != -1) res += ' highlighted';
					else res += ' blured';

					return res;
				});

			chord2.selectAll('.vis__chord__labels__label')
				.attr('class', function(dd) {
					var res = 'vis__chord__labels__label';
					if (dd.left) res += ' vis__chord__labels__label--left';

					if (d == dd) res += ' selected';
					else if (newConnectionNodes.indexOf(dd) != -1) res += ' new';
					else if (sameConnectionNodes.indexOf(dd) != -1) res += ' highlighted';
					else res += ' blured';

					return res;
				});

			d3.selectAll('.vis__chord__ribbons__line')
				.classed('selected', function(dd) {
					return d.links1.indexOf(dd) != -1 || d.links2.indexOf(dd) != -1;
				});
		}

		function outNode(d) {
			d3.selectAll('.vis__chord__labels__label')
				.classed('selected', false)
				.classed('highlighted', false)
				.classed('old', false)
				.classed('new', false)
				.classed('blured', false);
			d3.selectAll('.vis__chord__ribbons__line')
				.classed('selected', false)
				.classed('blured', false);
		}
	}
}
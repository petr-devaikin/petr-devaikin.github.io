function Geovis(svg, ladsMapGB, ladsMapNI, ladsAreas, data, p) {
	var params = {
		areasToZoom: ['Wales', 'England', 'Scotland'],
		minOpacity: .1,
		maxOpacity: .8,
		buttonSize: 40,
		selectLadCallback: undefined,
		margin: 50,
		labelLeft: '',
		labelRight: '',
		transitionDuration: 750,
	}

	Object.keys(p).forEach(function(key) { params[key] = p[key]; });

	var width,
		height;

	var welshBorder;

	var ladLands;
	var landHash = {};

	var vScale;
	var projection;
	var path;

	var mapLeft,
		mapRight,
		ladsAreaLeft,
		ladsAreaRight,
		connectionsAreaLeft,
		connectionsAreaRight,
		hintArea,
		controlsArea;

	var zoom,
		initTransform;

	var zoomInButton,
		zoomOutButton,
		zoomInitButton;

	var transition;

	var selectedLad = undefined;

	function calculateAutoZoom(data) {
		function isLadInAreaToZoom(name) {
			if (selectedLad === undefined)
				return data.find(function(d) { return d.from == name || d.to == name }) !== undefined;
			else
				return landHash[name] == selectedLad || landHash[name].toHighlighted || landHash[name].fromHighlighted;
			//return params.areasToZoom.indexOf(ladsAreas[name]) != -1;
		}

		var meshToZoom = topojson.mesh(
			ladsMapGB,
			ladsMapGB.objects.lads,
			function(a, b) {
				if (a === b && isLadInAreaToZoom(a.properties.lad16nm)) return true;

				if (a !== b &&
					((isLadInAreaToZoom(a.properties.lad16nm) && !isLadInAreaToZoom(b.properties.lad16nm)) ||
					(!isLadInAreaToZoom(a.properties.lad16nm) && isLadInAreaToZoom(b.properties.lad16nm))))
						return true;

				return false;
			}
		);

		var p = d3.geoAlbers().rotate([0, 0])
			.fitExtent([[params.margin, 2 * params.margin], [width / 2 - params.margin, height - params.margin]], meshToZoom);

		initTransform = d3.zoomIdentity
			.translate(p.translate()[0], p.translate()[1])
			.scale(p.scale());
	}

	function init() {
		svg.html('').classed('vis--geovis', true);

		width = svg.node().getBoundingClientRect().width;
		height = svg.node().getBoundingClientRect().height;

		// clipping area
		
		svg.append('defs').append('clipPath').attr('id', 'map-clip')
			.append('rect')
				.attr('x', 0).attr('y', 0)
				.attr('width', width / 2).attr('height', height);

		// process geo data
		ladLands = topojson.feature(ladsMapGB, ladsMapGB.objects.lads).features;
		ladLands.forEach(function(f) {
			f.name = f.properties.lad16nm;
			f.area = ladsAreas[f.name];
			f.isWelsh = f.area == 'Wales';
			landHash[f.name] = f;
		});

		var ladLandsNI = topojson.feature(ladsMapNI, ladsMapNI.objects.lgd).features;
		ladLandsNI.forEach(function(f) {
			f.name = f.properties.LGDNAME;
			f.area = 'Northern Ireland';
			f.isWelsh = false;
			landHash[f.name] = f;
		});

		ladLands = ladLands.concat(ladLandsNI);

		// welsh border
		/*
		function isWelsh(name) {
			return ladsAreas[name] == 'Wales';
		}

		welshBorder = topojson.mesh(
			ladsMap,
			ladsMap.objects.lads,
			function(a, b) { return a !== b && (
				(!isWelsh(b.properties.lad16nm) && isWelsh(a.properties.lad16nm)) ||
				(isWelsh(b.properties.lad16nm) && !isWelsh(a.properties.lad16nm))); }
		)
		*/


		// projection
		projection = d3.geoAlbers().rotate([0, 0]);

		path = d3.geoPath(projection);

		// calculate initial zoom
		calculateAutoZoom(data);

		// areas

		mapLeft = svg.append('g').classed('vis__map', true).classed('vis__map--left', true)
			.attr('clip-path', 'url(#map-clip)');
		mapRight = svg.append('g').classed('vis__map', true).classed('vis__map--right', true)
			.attr('clip-path', 'url(#map-clip)')
			.attr('transform', 'translate({0},{1})'.format(width / 2, 0));

		mapLeft.append('rect').classed('vis__map__bg', true)
			.attr('width', width / 2).attr('height', height);
		mapRight.append('rect').classed('vis__map__bg', true)
			.attr('width', width / 2).attr('height', height);

		svg.append('line').classed('vis__divider', true)
			.attr('x1', width / 2).attr('y1', 0)
			.attr('x2', width / 2).attr('y2', height);

		ladsAreaLeft = mapLeft.append('g').classed('vis__map__lads', true);
		ladsAreaRight = mapRight.append('g').classed('vis__map__lads', true);
		connectionsAreaLeft = mapLeft.append('g').classed('vis__map__connections', true);
		connectionsAreaRight = mapRight.append('g').classed('vis__map__connections', true);

		mapLeft.append('text').classed('vis__map__label', true)
			.attr('transform', 'translate({0},{1})'.format(width / 4, height - 10))
			.text(params.labelLeft);
		mapRight.append('text').classed('vis__map__label', true)
			.attr('transform', 'translate({0},{1})'.format(width / 4, height - 10))
			.text(params.labelRight);

		hintArea = svg.append('g').classed('vis__map__hints', true);

		// controls

		controlsArea = svg.append('g').attr('class', 'vis__controls')
			.attr('transform', 'translate({0},{1})'.format(10, height - params.buttonSize - 10));
			
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
		function addHint(area, cl) {
			var hint = area.append('g').classed(cl, true).attr('visibility', 'hidden');
			hint.append('rect');
			hint.append('text');
		}

		addHint(hintArea, 'vis__map__hints__lad');
		addHint(hintArea, 'vis__map__hints__connection');


		// zoom behaviour

		function zoomed() {
			var transform = d3.event.transform;

			projection
				.translate([transform.x, transform.y])
				.scale(transform.k);

			d3.select(this).selectAll('.vis__map__lads__lad').attr("d", path);
			d3.select(this).selectAll('.vis__map__border').attr("d", path);

			d3.select(this).selectAll('.vis__map__connections__line').call(updateConnections);

			if (d3.event.sourceEvent instanceof MouseEvent) {
				if (this == mapLeft.node())
					mapRight.call(zoom.transform, transform);
				else if (this == mapRight.node())
					mapLeft.call(zoom.transform, transform);
			}
		}

	    zoom = d3.zoom()
			.scaleExtent([0.5 * initTransform.k, 8 * initTransform.k])
			.on("zoom", zoomed);

		mapLeft.call(zoom.transform, initTransform);
		mapLeft.call(zoom).on('dblclick.zoom', null);
		mapRight.call(zoom.transform, initTransform);
		mapRight.call(zoom).on('dblclick.zoom', null);

		// transition
		transition = d3.transition()
		    .duration(params.transitionDuration)
		    .ease(d3.easeLinear);
	}
	init();


	function updateConnections(connectionSelection) {
		function setPath(d) {
			var distance = Math.sqrt(
				(d.fromCentroid[0] - d.toCentroid[0]) * (d.fromCentroid[0] - d.toCentroid[0]) +
				(d.fromCentroid[1] - d.toCentroid[1]) * (d.fromCentroid[1] - d.toCentroid[1])
			);
			var dirFlag = d.fromCentroid[0] < d.toCentroid[0] ? 1 : 0;
			res = '';
			res += 'M{0} {1} '.format(d.fromCentroid[0], d.fromCentroid[1]);
			//res += 'A {0} {0} 0 0 {1} {2} {3}'.format(distance, dirFlag, d.toCentroid[0], d.toCentroid[1]);
			res += 'C {0} {1} {2} {3} {4} {5}'.format(
				d.fromCentroid[0], d.fromCentroid[1] - distance / 2 - 15 * d.value / 100,
				d.toCentroid[0], d.toCentroid[1] - distance / 2 - 15 * d.value / 100 - 5,
				d.toCentroid[0], d.toCentroid[1] - 5
			);
			return res;
		}

		connectionSelection.each(function(d) {
			d.fromCentroid = path.centroid(d.landFrom);
			d.toCentroid = path.centroid(d.landTo);
		});

		connectionSelection.select('.vis__map__connections__line__bg').attr('d', setPath);
		connectionSelection.select('.vis__map__connections__line__line')
			.attr('d', setPath)
			.attr('opacity', function(d) { return vScale(d.value); });

		connectionSelection.select('.vis__map__connections__line__point--start')
			.attr('transform', function(d) {
				return 'translate({0},{1})'.format(d.fromCentroid[0], d.fromCentroid[1]);
			})
			.attr('opacity', function(d) { return vScale(d.value); });
		connectionSelection.select('.vis__map__connections__line__point--end')
			.attr('transform', function(d) {
				return 'translate({0},{1})'.format(d.toCentroid[0], d.toCentroid[1]);
			})
			.attr('opacity', function(d) { return vScale(d.value); });
	}

	this.draw = function() {
		function addLads(ladsArea) {
		    var newMapLads = ladsArea.selectAll(".vis__map__lads__lad")
				.data(ladLands)
				.enter().append("path")
					.classed('vis__map__lads__lad', true)
					.classed('vis__map__lads__lad--welsh', function(d) { return d.isWelsh; })
					.attr("d", path)
					.attr('fill', function(d) {
						return d.isWelsh ? '#ddd' : '#eee';
					})
					.style('cursor', 'pointer');

			newMapLads
				.on('mousemove', overLad)
				.on('mouseout', outLad)
				.on('click', function(d) { d3.event.stopPropagation(); selectLad(d); });
		}
		addLads(ladsAreaLeft);
		addLads(ladsAreaRight);


		// Welsh border
		/*map.append('path')
			.classed('vis__map__border', true)
			.datum(welshBorder)
			.attr('d', path);
		*/

		drawConnections(data);
	}

	function drawConnections(newData) {
		data = newData;

		// process data
		data.forEach(function(d) {
			var landFrom = landHash[d.from];
			var landTo = landHash[d.to];

			if (landFrom === undefined) console.log('Cannot find LAD ' + d.from);
			if (landTo === undefined) console.log('Cannot find LAD ' + d.to);

			if (landFrom !== undefined && landTo !== undefined) {
				d.landFrom = landHash[d.from];
				d.landTo = landHash[d.to];
			}
		});

		data = data.filter(function(d) { return d.landFrom != undefined; });

		var maxValue = 100;//d3.max(data, function(d) { return d.value; });
		vScale = d3.scaleSqrt().domain([0, maxValue]).range([params.minOpacity, params.maxOpacity]);

		// update auto zoom
		calculateAutoZoom(data);

		// draw connections
		function addConnections(connectionsArea, data) {
			var connections = connectionsArea.selectAll('.vis__map__connections__line').data(data);

			connections.exit().remove();

			var newConnections = connections.enter().append('g')
				.classed('vis__map__connections__line', true)
				.on('mousemove', overConnection)
				.on('mouseout', outConnection);

			newConnections.append('ellipse').attr('class', 'vis__map__connections__line__point vis__map__connections__line__point--start')
				.attr('rx', 1).attr('ry', .5)
				.attr('stroke', function(d) { return params.categoryColors[d.category]; });
			newConnections.append('path').attr('class', 'vis__map__connections__line__point vis__map__connections__line__point--end')
				.attr('d', function(d) {
					return 'M -2 -5 L 0 0 L 2 -5';
				})
				.attr('stroke', function(d) { return params.categoryColors[d.category]; })
				.attr('fill', function(d) { return params.categoryColors[d.category]; });

			newConnections.append('path')
				.classed('vis__map__connections__line__bg', true);

			newConnections.append('path')
				.classed('vis__map__connections__line__line', true)
				.attr('stroke', function(d) { return params.categoryColors[d.category]; });

			connections.call(updateConnections);
			newConnections.call(updateConnections);
		}

		addConnections(connectionsAreaLeft, data.filter(function(d) { return d.category == 'outward'; }));
		addConnections(connectionsAreaRight, data.filter(function(d) { return d.category == 'inward'; }));

		if (selectedLad !== undefined)
			selectLad(selectedLad);
	}

	this.redraw = drawConnections;

	this.select = function(ladName) {
		var lad = ladLands.find(function(d) { return d.name == ladName; });
		selectLad(lad);
	}

	// interaction
	function updateHint(hint, pos, text) {
		hint.attr('transform', 'translate({0},{1})'.format(pos[0], pos[1]));
		var rect = hint.select('rect');
		
		hint.select('text').text(text);

		rect.attr('width', 0).attr('height', 0);
		var bbox = hint.node().getBBox();
		rect.attr('x', bbox.x - 2).attr('y', bbox.y - 2)
			.attr('width', bbox.width + 4).attr('height', bbox.height + 4);

		hint.attr('visibility', 'visible');
	}

	function overLad(d) {
		d.hovered = true;
		d3.select(this).classed('hovered', true);

		// show lad hint
		var pos = [d3.event.clientX, d3.event.clientY];
		pos[1] -= 10;

		updateHint(hintArea.select('.vis__map__hints__lad'), pos, d.name);
	}

	function outLad(d) {
		d.hovered = false;
		d3.select(this).classed('hovered', false);
		hintArea.select('.vis__map__hints__lad').attr('visibility', 'hidden');
	}

	function overConnection(d) {
		d3.select(this).classed('highlighted', true);

		var bbox = this.getBBox();
		var pos = [d3.event.clientX, d3.event.clientY - 10];
		var text = 'From {0} to {1}: {2}%'.format(d.landFrom.name, d.landTo.name, d.value.abbrNum(2));
			
		updateHint(hintArea.select('.vis__map__hints__connection'), pos, text);
	}

	function outConnection() {
		d3.select(this).classed('highlighted', false);

		hintArea.select('.vis__map__hints__connection').attr('visibility', 'hidden');
	}

	function selectLad(d) {
		if (selectedLad !== undefined) {
			selectedLad.selected = false;
		}

		if (d !== undefined) {
			d.selected = true;

			// show lad hint
		}

		selectedLad = d;

		ladLands.forEach(function(d) {
			d.toHighlighted = false;
			d.fromHighlighted = false;
		})

		connectionsAreaLeft.selectAll('.vis__map__connections__line')
			.classed('blured', function(dd) {
				if (selectedLad === undefined) {
					return false;
				}
				else {
					if (dd.landFrom == d) {
						dd.landTo.toHighlighted = true;
						return false;
					}
					else if (dd.landTo == d) {
						dd.landFrom.toHighlighted = true;
						return false;
					}
					else
						return true;
				}
			});
		connectionsAreaRight.selectAll('.vis__map__connections__line')
			.classed('blured', function(dd) {
				if (selectedLad === undefined) {
					dd.landTo.fromHighlighted = false;
					dd.landFrom.fromHighlighted = false;
					return false;
				}
				else {
					if (dd.landTo == d) {
						dd.landFrom.fromHighlighted = true;
						return false;
					}
					else if (dd.landFrom == d) {
						dd.landTo.fromHighlighted = true;
						return false;
					}
					else
						return true;
				}
			});

		ladsAreaLeft.selectAll('.vis__map__lads__lad')
			.classed('selected', function(d) { return d.selected; })
			.classed('highlighted', function(d) { return d.toHighlighted; });
		ladsAreaRight.selectAll('.vis__map__lads__lad')
			.classed('selected', function(d) { return d.selected; })
			.classed('highlighted', function(d) { return d.fromHighlighted; });

		if (params.selectLadCallback !== undefined)
			params.selectLadCallback(selectedLad !== undefined ? selectedLad.name : '');

		calculateAutoZoom(data);
	}

	svg.on("click", function() {
		console.log('reset selection');
		selectLad();
	});


	// buttons

	zoomInButton.on('click', function() {
		event.stopPropagation();
		zoom.scaleBy(mapLeft, 1.1);
		zoom.scaleBy(mapRight, 1.1);
	});

	zoomOutButton.on('click', function() {
		event.stopPropagation();
		zoom.scaleBy(mapLeft, .9);
		zoom.scaleBy(mapRight, .9);
	});

	zoomInitButton.on('click', function() {
		event.stopPropagation();
		mapLeft
			.transition(transition)
			.call(zoom.transform, initTransform);
		mapRight
			.transition(transition)
			.call(zoom.transform, initTransform);
	});
}


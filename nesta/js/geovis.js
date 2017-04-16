function Geovis(svg, ladsMap, ladsAreas, data, p) {
	var params = {
		areasToZoom: ['Wales', 'England', 'Scotland'],
		maxOpacity: 1,
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
		hintAreaLeft,
		hintAreaRight;

	var zoom;

	var hintLadHover,
		hintLadSelected,
		hintConnectionFrom,
		hintConnectionTo;

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
		ladLands = topojson.feature(ladsMap, ladsMap.objects.lads);
		ladLands.features.forEach(function(f) {
			f.name = f.properties.lad16nm;
			f.area = ladsAreas[f.name];
			f.isWelsh = f.area == 'Wales';
			landHash[f.name] = f;
		});

		// welsh border
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

		// calculate initial zoom
		function isLadInAreaToZoom(name) {
			return params.areasToZoom.indexOf(ladsAreas[name]) != -1;
		}

		var meshToZoom = topojson.mesh(
			ladsMap,
			ladsMap.objects.lads,
			function(a, b) {
				if (a === b && isLadInAreaToZoom(a.properties.lad16nm)) return true;

				if (a !== b &&
					((isLadInAreaToZoom(a.properties.lad16nm) && !isLadInAreaToZoom(b.properties.lad16nm)) ||
					(!isLadInAreaToZoom(a.properties.lad16nm) && isLadInAreaToZoom(b.properties.lad16nm))))
						return true;

				return false;
			}
		);

		// projection
		projection = d3.geoAlbers()
			.rotate([0, 0])
			.parallels([55, 60])
			.fitSize([width / 2, height], meshToZoom);

		path = d3.geoPath(projection);

		// scale
		var maxValue = d3.max(data, function(d) { return d.value; });
		vScale = d3.scaleSqrt().domain([0, maxValue]).range([0, params.maxOpacity]);

		// areas

		mapLeft = svg.append('g').classed('vis__map', true)
			.attr('clip-path', 'url(#map-clip)');
		mapRight = svg.append('g').classed('vis__map', true)
			.attr('clip-path', 'url(#map-clip)')
			.attr('transform', 'translate({0},{1})'.format(width/2, 0));

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
		hintAreaLeft = mapLeft.append('g').classed('vis__map__hints', true);
		hintAreaRight = mapRight.append('g').classed('vis__map__hints', true);


		// hint
		/*
		hint = map.append('g').classed('vis__map__hint', true);
		hint.append('rect').classed('vis__map__hint__bg', true);
		hint.append('text').classed('vis__map__hint__name', true);
		hint.append('text').classed('vis__map__hint__name', true);
		hint.append('text').classed('vis__map__hint__name', true);
		*/

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
	}
	init();

	function updateConnections(connectionsArea) {
		data.forEach(function(d) {
			d.fromCentroid = path.centroid(d.landFrom);
			d.toCentroid = path.centroid(d.landTo);
		});

		connectionsArea.selectAll('.vis__map__connections__line').selectAll('path')
			.attr('d', function(d) {
				var distance = Math.sqrt(
					(d.fromCentroid[0] - d.toCentroid[0]) * (d.fromCentroid[0] - d.toCentroid[0]) +
					(d.fromCentroid[1] - d.toCentroid[1]) * (d.fromCentroid[1] - d.toCentroid[1])
				);
				var dirFlag = d.fromCentroid[0] < d.toCentroid[0] ? 1 : 0;
				res = '';
				res += 'M{0} {1} '.format(d.fromCentroid[0], d.fromCentroid[1]);
				res += 'A {0} {0} 0 0 {1} {2} {3}'.format(distance, dirFlag, d.toCentroid[0], d.toCentroid[1]);
				return res;
			});
	}

	this.draw = function() {
		function addLads(ladsArea) {
		    var newMapLads = ladsArea.selectAll(".vis__map__lads__lad")
				.data(ladLands.features)
				.enter().append("path")
					.classed('vis__map__lads__lad', true)
					.classed('vis__map__lads__lad--welsh', function(d) { return d.isWelsh; })
					.attr("d", path)
					.attr('fill', function(d) {
						return d.isWelsh ? '#ddd' : '#eee';
					})
					.style('cursor', 'pointer');

			newMapLads
				.on('mouseover', overLad)
				.on('mouseout', outLad)
				.on('click', selectLad);
		}
		addLads(ladsAreaLeft);
		addLads(ladsAreaRight);


		// Welsh border
		/*map.append('path')
			.classed('vis__map__border', true)
			.datum(welshBorder)
			.attr('d', path);
		*/

		// draw connections
		function addConnections(connectionsArea, data, isFrom) {
			var connections = connectionsArea.selectAll('.vis__connections__line').data(data).enter()
				.append('g')
				.classed('vis__map__connections__line', true)
				.on('mouseover', function(d) {
					if (d.category == 'outward') {
						overLad(landHash[d.from]);
						// show hint to
					}
					else {
						overLad(landHash[d.to]);
						// show hint from
					}
				})
				.on('mouseout', function(d) {
					if (d.category == 'outward')
						outLad(landHash[d.from]);
					else
						outLad(landHash[d.to]);
				})
				.on('click', function(d) {
					if (d.category == 'outward')
						selectLad(landHash[d.from]);
					else
						selectLad(landHash[d.to]);
				});

			connections.append('path')
				.classed('vis__map__connections__line__bg', true);

			connections.append('path')
				.classed('vis__map__connections__line__line', true)
				.attr('stroke', function(d) {
					return params.categoryColors[d.category];
				})
				.attr('opacity', function(d) {
					return vScale(d.value);
				});

			updateConnections(connectionsArea);
		}

		addConnections(connectionsAreaLeft, data.filter(function(d) { return d.category == 'outward'; }));
		addConnections(connectionsAreaRight, data.filter(function(d) { return d.category == 'inward'; }));

		// zoom behaviour

		function zoomed(mute) {
			var transform = d3.event.transform;

			projection
				.translate([transform.x, transform.y])
				.scale(transform.k);

			d3.select(this).selectAll('.vis__map__lads__lad').attr("d", path);
			d3.select(this).selectAll('.vis__map__border').attr("d", path);

			updateConnections(d3.select(this).select('.vis__map__connections'));

			if (d3.event.sourceEvent instanceof MouseEvent) {
				if (this == mapLeft.node())
					mapRight.call(zoom.transform, transform);
				else if (this == mapRight.node())
					mapLeft.call(zoom.transform, transform);
			}
		}


		var scale0 = projection.scale(),
			translate0 = projection.translate();

	    zoom = d3.zoom()
			.scaleExtent([0.5 * scale0, 3 * scale0])
			.on("zoom", zoomed);

		var t = d3.zoomIdentity
			.translate(translate0[0], translate0[1])
			.scale(scale0);

		mapLeft.call(zoom.transform, t);
		mapLeft.call(zoom);
		mapRight.call(zoom.transform, t);
		mapRight.call(zoom);
	}

	// interaction
	function overLad(d) {
		d.hovered = true;
		ladsAreaLeft.selectAll('.vis__map__lads__lad')
			.classed('hovered', function(d) { return d.hovered; });
		ladsAreaRight.selectAll('.vis__map__lads__lad')
			.classed('hovered', function(d) { return d.hovered; });

		// show lad hint
		// if lad selected show hint for connection
	}

	function outLad(d) {
		d.hovered = false;
		ladsAreaLeft.selectAll('.vis__map__lads__lad.hovered').classed('hovered', false);
		ladsAreaRight.selectAll('.vis__map__lads__lad.hovered').classed('hovered', false);
	}

	var selectedLad = undefined;

	function selectLad(d) {
		if (selectedLad !== undefined) {
			selectedLad.selected = false;
		}

		if (d !== undefined) {
			d3.event.stopPropagation();
			d.selected = true;

			// show lad hint
		}

		selectedLad = d;

		ladsAreaLeft.selectAll('.vis__map__lads__lad')
			.classed('selected', function(d) { return d.selected; });
		ladsAreaRight.selectAll('.vis__map__lads__lad')
			.classed('selected', function(d) { return d.selected; });

		connectionsAreaLeft.selectAll('.vis__map__connections__line')
			.classed('blured', function(dd) {
				if (selectedLad === undefined)
					return false;
				else
					return dd.landFrom != d && dd.landTo != d;
			});
		connectionsAreaRight.selectAll('.vis__map__connections__line')
			.classed('blured', function(dd) {
				if (selectedLad === undefined)
					return false;
				else
					return dd.landFrom != d && dd.landTo != d;
			});
	}

	svg.on("click", function() {
		console.log('reset selection');
		selectLad();
	});
}


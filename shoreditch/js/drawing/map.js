define(['lib/d3', 'constants', 'interaction/events'], function(d3, constants, events) {
    var container = d3.select('.m-map__photos');
    var containerHeight = container.node().getBoundingClientRect().height;

    var ZOOM = 16;
    var photoSize = 2;
    var MAP_WIDTH = 621;
    var MAP_HEIGHT = 621;

    var map;

    function prepareData(data, callback) {
        var mapCentre = new google.maps.LatLng(51.523663, -0.076783);

        var mapStyles = [
            { elementType: 'labels', stylers: [{ visibility: 'on' }, { lightness: 80 }], },
            { featureType: 'landscape', stylers: [{ lightness: 100 }], },
            { featureType: 'poi', stylers: [{ visibility: 'off' }], },
            {
                elementType: 'geometry.fill',
                featureType: 'poi.park',
                stylers: [{ visibility: 'on' }, { lightness: 90 }, { saturation: -100 }],
            },
            { featureType: 'road', stylers: [{ saturation: -100, lightness: -90 }], },
            {
                elementType: 'geometry.stroke',
                featureType: 'road.arterial',
                stylers: [{ visibility: 'on' }],
            },
            { featureType: 'road.highway', stylers: [{ lightness: 60 }], },
            { featureType: 'transit', stylers: [{ visibility: 'off' }], },
            { featureType: 'water', stylers: [{ lightness: 50 }], },
        ];

        var styledMap = new google.maps.StyledMapType(mapStyles, {name: "Styled Map"});

        var mapOptions = {
            center: mapCentre,
            zoom: ZOOM,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style'],
            },
            disableDefaultUI: true,
            draggable: false,
            zoomControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true
        };

        map = new google.maps.Map(document.querySelector(".m-map__bg"), mapOptions);

        var overlay = new google.maps.OverlayView();
        overlay.draw = function() {};
        overlay.setMap(map);

        google.maps.event.addListenerOnce(map, "idle", onMapLoaded);

        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');

        function onMapLoaded() {
            var mapCanvasProjection = overlay.getProjection();
            /*var north = new google.maps.LatLng(MAX_LATITUDE, (MIN_LONGITUDE + MAX_LONGITUDE) / 2),
                south = new google.maps.LatLng(MIN_LATITUDE, (MIN_LONGITUDE + MAX_LONGITUDE) / 2),
                west = new google.maps.LatLng((MAX_LATITUDE + MIN_LATITUDE) / 2, MIN_LONGITUDE),
                east = new google.maps.LatLng((MAX_LATITUDE + MIN_LATITUDE) / 2, MAX_LONGITUDE);

            var northPoint = mapCanvasProjection.fromLatLngToDivPixel(north),
                southPoint = mapCanvasProjection.fromLatLngToDivPixel(south),
                westPoint = mapCanvasProjection.fromLatLngToDivPixel(west),
                eastPoint = mapCanvasProjection.fromLatLngToDivPixel(east);

            PIXELS_PER_LONGITUDE = (eastPoint.x - westPoint.x) / (MAX_LONGITUDE - MIN_LONGITUDE);
            PIXELS_PER_LATITUDE = (southPoint.y - northPoint.y) / (MAX_LATITUDE - MIN_LATITUDE);*/

            //set_full_map_size();
            google.maps.event.trigger(map, 'resize');
            map.setCenter(mapCentre);

            var newData = [];

            for (var i = 0; i < data.length; i++) {
                data[i].latlng = new google.maps.LatLng(data[i].latitude, data[i].longitude);
                data[i].position = mapCanvasProjection.fromLatLngToDivPixel(data[i].latlng);
                data[i].position.x = Math.round(data[i].position.x);
                data[i].position.y = Math.round(data[i].position.y);
                if (data[i].position.x >= 0 && data[i].position.x <= MAP_WIDTH &&
                    data[i].position.y >= 0 && data[i].position.y <= MAP_HEIGHT)
                    newData.push(data[i]);
            }

            callback(newData);
        }
    }


    function drawData(data) {
        console.log('Map: start');

        var locations = [];

        for (var i = 0; i < data.length; i++) {
            var location = locations.find(function(a) {
                return a.x == data[i].position.x && a.y == data[i].position.y;
            });

            if (location === undefined) {
                var newLocation = {
                    x: data[i].position.x,
                    y: data[i].position.y,
                    photos: [data[i]]
                };

                locations.push(newLocation);
            }
            else {
                location.photos.push(data[i]);
            }
        }

        var locationObjs = container
            .selectAll('.m-map__photos__location')
                .data(locations, function(d) { return d.x + '-' + d.y; });

        locationObjs
            .classed('m-map__photos__location--minified', function(d) { return d.photos.length > 225; })
            .attr('data-count', function(d) { return d.photos.length; })
                .style('width', function(d) { return Math.sqrt(d.photos.length) * photoSize + 'px'; })
                .style('height', function(d) { return Math.sqrt(d.photos.length) * photoSize + 'px'; })
                .style('left', function(d) { return d.x + 'px'; })
                .style('bottom', function(d) { return containerHeight - d.y + 'px'; });

        locationObjs.exit().remove();

        var newLocationObjs = locationObjs
            .enter().append('div')
                .classed('m-map__photos__location', true)
                .classed('m-map__photos__location--minified', function(d) { return d.photos.length > 225; })
                .attr('data-count', function(d) { return d.photos.length; })
                .style('width', function(d) { return Math.sqrt(d.photos.length) * photoSize + 'px'; })
                .style('height', function(d) { return Math.sqrt(d.photos.length) * photoSize + 'px'; })
                .style('left', function(d) { return d.x + 'px'; })
                .style('bottom', function(d) { return containerHeight - d.y + 'px'; });

        var locationInnerObjs = newLocationObjs
            .append('div')
            .classed('m-map__photos__location__inner', true);

        var photoObjs = locationInnerObjs.selectAll('.m-map__photos__location__inner__photo')
                .data(function(d) { return d.photos; }, function(d) { return d.id; });

        photoObjs.exit().remove();

        photoObjs
            .enter().append('div')
                .classed('m-map__photos__location__inner__photo', true)
                .style('background', function(d) { return d.main_color; })
                .style('width', function() { return photoSize + 'px'; })
                .style('height', function() { return photoSize + 'px'; });
                //.on('mouseover', events.photoHover);
    }

    return {
        prepareData: prepareData,
        draw: drawData
    }
});

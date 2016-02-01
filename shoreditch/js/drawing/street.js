define(['libs/d3', 'constants', 'drawing/basics'], function(d3, constants, basics) {
    function drawStreetView() {
        basics.streetContainer
            .style('width', basics.scale(constants.streetLength) + 'px');

        drawLandmark();
    }

    function drawLandmark() {
        var landmarks = basics.streetContainer.select('#landmarks').selectAll('.landmark')
                .data(constants.landmarks)
            .enter().append('div')
                .classed('landmark', true);

        landmarks.each(function(d) {
            var obj = d3.select(this);
            switch (d.type) {
                case 'street':
                    drawStreet(obj);
                    break;
                case 'metro':
                    drawMetro(obj);
                    break;
                case 'river':
                    drawRiver(obj);
                    break;
                case 'building':
                    drawBuilding(obj);
                    break;
                case 'park':
                    drawPark(obj);
                    break;
                case 'square':
                    drawSquare(obj);
                    break;
            }
            obj.classed(d.type, true);
            obj.style('left', basics.scale(d.km) + 'px');
        });
    }

    function setWidth(selection) {
        selection.style('width', function(d) {
            return d.width / constants.streetLength * constants.streetWidth + 'px';
        });
        selection.style('margin-left', function(d) {
            return - d.width / constants.streetLength * constants.streetWidth / 2 + 'px';
        });
    }

    function addName(selection) {
        selection.append('span')
            .classed('name', true)
            .text(function(d) { return d.name; });
    }

    function drawStreet(obj) {
        obj.call(setWidth);

        if (obj.datum().position == 'top' || obj.datum().position == 'both')
            obj.append('div')
                .classed('street__part--top', true)
                .classed('street__part', true);
        if (obj.datum().position == 'bottom' || obj.datum().position == 'both')
            obj.append('div')
                .classed('street__part--bottom', true)
                .classed('street__part', true);

        obj.classed('street--bottom', function(d) { return d.position == 'bottom'; })

        obj.call(addName);
    }
    

    function drawMetro(obj) {
        obj.append('div')
            .classed('metro-sign', true);
        obj.append('div')
            .classed('metro-name', true)
            .text(function(d) {return d.name; });

        obj.classed('metro--top', function(d) { return d.top; })
    }
    

    function drawRiver(obj) {
        obj.call(setWidth);
        obj.call(addName);

        obj.append('div')
            .classed('street__part', true)
            .classed('street__part--top', true);
        obj.append('div')
            .classed('street__part', true)
            .classed('street__part--bottom', true);
    }

    function drawBuilding(obj) {
    }

    function drawPark(obj) {
        obj.call(addName);
    }

    function drawSquare(obj) {
    }

    return {
        draw: drawStreetView,
    }
});
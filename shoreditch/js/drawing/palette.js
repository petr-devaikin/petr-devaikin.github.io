define(['lib/d3', 'constants', 'interaction/events'], function(d3, constants, events) {
    var container = d3.select('.m-palette');

    function drawBg() {

    }

    function getPosition(d) {
        var color = d3.rgb(d.main_color).hsl();
        var alpha = color.s == 0 || color.l == 0 ? 0 : color.h / 180 * Math.PI;
        var r = color.l == 0 ? 0 : 250 * color.s;

        return {
            x: 250 + r * Math.sin(alpha),
            y: 250 - r * Math.cos(alpha)
        }
    }

    function getXPosition(d) { return getPosition(d).x + 'px'; }
    function getYPosition(d) { return getPosition(d).y + 'px'; }

    function drawData(data) {
        console.log('Palette: start');

        container
            .selectAll('.m-palette__photo')
                .data(data)
            .enter().append('div')
                .classed('m-palette__photo', true)
                .style('left', getXPosition)
                .style('top', getYPosition)
                .style('background', function(d) { return d.main_color; })
                .on('mouseover', events.photoHover);

        console.log('Palette: done');
    }

    function draw(data) {
        drawBg();
        drawData(data);
    }

    return {
        draw: draw,
    }
});

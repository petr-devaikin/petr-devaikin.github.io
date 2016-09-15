function paintLegend() {
    var groups = d3.select('#legend').selectAll('.legendGroup');
    groups.remove();

    groups = groups.data(legend).enter()
        .append('div')
            .classed('legendGroup', true)
            .style('border-top-color', function(d) {
                return getColor(d.min);
            });


    groups.filter(function(d, i) { return i == 0; })
        .append('span')
        .classed('min', true)
        .text(function(d) {
            return d.min;
        });

    groups
        .append('span')
        .classed('max', true)
        .text(function(d) {
            return d.max;
        });
}

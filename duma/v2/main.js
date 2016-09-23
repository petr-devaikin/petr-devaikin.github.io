var CONVO_MARGIN = 100,
    CONVO_OFFSET = 100,

    WIDTH = 1000,
    HEIGHT = 200;


var svg;


function drawConvocations() {
    var convocations = svg.selectAll('.convocation').data(a_convocations).enter();
    console.log(a_convocations);

    var groups = convocations.append('g')
        .classed('convocation', true)
        .attr('transform', d => 'translate(' + (CONVO_MARGIN + (d.number - 1) * CONVO_OFFSET) + ',0)');
    groups.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', HEIGHT);
}

function drawFractions() {
    var fractions = svg.selectAll('.fraction').data(a_fractions).enter();

    var groups = fractions.append('g')
        .classed('fraction', true)
        .attr('transform', d => 'translate(' +
            (CONVO_MARGIN + (d_convocations[d.convocationId].number - 1) * CONVO_OFFSET) + ',' +
            d.offset + ')');

    groups.append('rect')
        .attr('x', -10)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', d => d.size);
}


function draw() {
    svg = d3.select('svg');

    drawConvocations();
    drawFractions();
}

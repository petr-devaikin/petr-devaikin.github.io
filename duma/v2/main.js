if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

//=====================


var CONVO_MARGIN = 100,
    CONVO_OFFSET = 100,

    WIDTH = 1000,
    HEIGHT = 200,

    FRACTION_WIDTH = 20,
    FRACTION_LEVEL_X = 5,
    FRACTION_LEVEL_Y = 5;


var svg;

//=====================


function fractionPosition(fraction) {
    return [
        (CONVO_MARGIN + (d_convocations[fraction.convocationId].number - 1) * CONVO_OFFSET),
        fraction.offset
    ]
}


function drawConvocations() {
    var convocations = svg.selectAll('.convocation').data(a_convocations).enter();

    var groups = convocations.append('g')
        .classed('convocation', true)
        .attr('transform', d => 'translate({0},0)'.format(CONVO_MARGIN + (d.number - 1) * CONVO_OFFSET));
    groups.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', HEIGHT);
}

function drawTransitions() {
    var transitions = svg.selectAll('.transition').data(a_transitions).enter();

    var groups = transition.append('g')
        .classed('transition', true);

    groups.append('path')
        .attr('d', function(d) {
            return 'M{0},{1}L{2},{3}L{4},{5}L{6},{7}';
        });
}

function drawFractions() {
    var fractions = svg.selectAll('.fraction').data(a_fractions).enter();

    var groups = fractions.append('g')
        .classed('fraction', true)
        .attr('transform', d => String.prototype.format.apply('translate({0},{1})', fractionPosition(d)));

    groups.append('rect')
        .attr('x', -FRACTION_WIDTH / 2)
        .attr('y', 0)
        .attr('width', FRACTION_WIDTH)
        .attr('height', d => d.size)
        .attr('fill', d => d_parties[d.partyId].color);

    groups.append('path')
        .attr('d', d => 'M{0},{1}L{2},{3}L{4},{5}L{6},{7}z'.format(
            FRACTION_WIDTH / 2, 0,
            FRACTION_WIDTH / 2 + FRACTION_LEVEL_X, FRACTION_LEVEL_Y,
            FRACTION_WIDTH / 2 + FRACTION_LEVEL_X, d.size + FRACTION_LEVEL_Y,
            FRACTION_WIDTH / 2, d.size
        ))
        .attr('fill', d => d3.color(d_parties[d.partyId].color).darker(.5));

    groups.append('path')
        .attr('d', d => 'M{0},{1}L{2},{3}L{4},{5}L{6},{7}z'.format(
            -FRACTION_WIDTH / 2, 0,
            -FRACTION_WIDTH / 2 - FRACTION_LEVEL_X, FRACTION_LEVEL_Y,
            -FRACTION_WIDTH / 2 - FRACTION_LEVEL_X, d.size + FRACTION_LEVEL_Y,
            -FRACTION_WIDTH / 2, d.size
        ))
        .attr('fill', d => d3.color(d_parties[d.partyId].color).darker(.5));

    groups.filter(d => d.partyId == 8).append('path')
        .attr('d', d => 'M{0},{1}L{2},{3}L{4},{5},L{6},{7}z'.format(
            FRACTION_WIDTH / 2, d.size,
            FRACTION_WIDTH / 2 + FRACTION_LEVEL_X, d.size + FRACTION_LEVEL_Y,
            -FRACTION_WIDTH / 2 - FRACTION_LEVEL_X, d.size + FRACTION_LEVEL_Y,
            -FRACTION_WIDTH / 2, d.size
        ))
        .attr('fill', d => d3.color(d_parties[d.partyId].color).darker(1));
}


function draw() {
    svg = d3.select('svg');

    drawConvocations();
    drawFractions();
}

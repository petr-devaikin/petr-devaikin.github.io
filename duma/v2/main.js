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
    CONVO_OFFSET = 200,

    WIDTH = 1000,
    HEIGHT = 200,

    FRACTION_WIDTH = 20,
    FRACTION_LEVEL_X = 5,
    FRACTION_LEVEL_Y = 5;


var dom = {
    svg: undefined,
    convocations: undefined,
    fractions: undefined,
    transitions: undefined,
}

//=====================


function fractionPosition(fraction) {
    return [
        (CONVO_MARGIN + (d_convocations[fraction.convocationId].number - 1) * CONVO_OFFSET),
        fraction.offset
    ]
}


function drawConvocations() {
    var convocations = dom.convocations.selectAll('.convocation').data(a_convocations).enter();

    var groups = convocations.append('g')
        .classed('convocation', true)
        .attr('transform', function(d) { return 'translate({0},0)'.format(CONVO_MARGIN + (d.number - 1) * CONVO_OFFSET); });
    groups.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', HEIGHT);
}

function drawTransitions() {
    var transitionsDirect = dom.transitionsDirect.selectAll('.transition').data(a_transitions_direct).enter();
    var transitionsJump = dom.transitionsJump.selectAll('.transition').data(a_transitions_jump).enter();

    function drawHelper(transitions) {
        var groups = transitions.append('g')
            .classed('transition', true);

        groups.append('path')
            .attr('d', function(d) {
                var f1 = d_fractions[d.from],
                    f2 = d_fractions[d.to];
                var result = 'M{0},{1}L{2},{3}L{4},{5}L{6},{7}z'.format(
                    f1._position[0] + FRACTION_WIDTH / 2 + FRACTION_LEVEL_X,
                    f1._position[1] + FRACTION_LEVEL_Y + d.leftOffset,
                    f2._position[0] - FRACTION_WIDTH / 2 - FRACTION_LEVEL_X,
                    f2._position[1] + FRACTION_LEVEL_Y + d.rightOffset,
                    f2._position[0] - FRACTION_WIDTH / 2 - FRACTION_LEVEL_X,
                    f2._position[1] + FRACTION_LEVEL_Y + d.number + d.rightOffset,
                    f1._position[0] + FRACTION_WIDTH / 2 + FRACTION_LEVEL_X,
                    f1._position[1] + FRACTION_LEVEL_Y + d.number + d.leftOffset
                );

                return result;
            })
            .attr('fill', function(d) {
                return d_fractions[d.from]._color;
            });
    }

    drawHelper(transitionsDirect);
    drawHelper(transitionsJump);
}

function drawFractions() {
    var fractions = dom.fractions.selectAll('.fraction').data(a_fractions).enter();

    var groups = fractions.append('g')
        .classed('fraction', true)
        .attr('transform', function(d) {
            d._position = fractionPosition(d);
            d._color = d_parties[d.partyId].color;
            return 'translate({0},{1})'.format(d._position[0], d._position[1]);
        });

    groups.append('rect')
        .attr('x', -FRACTION_WIDTH / 2)
        .attr('y', 0)
        .attr('width', FRACTION_WIDTH)
        .attr('height', function(d) { return d.size; })
        .attr('fill', function(d) { return d._color; });

    groups.append('path')
        .attr('d', function(d) {
            return 'M{0},{1}L{2},{3}L{4},{5}L{6},{7}z'.format(
                FRACTION_WIDTH / 2, 0,
                FRACTION_WIDTH / 2 + FRACTION_LEVEL_X, FRACTION_LEVEL_Y,
                FRACTION_WIDTH / 2 + FRACTION_LEVEL_X, d.size + FRACTION_LEVEL_Y,
                FRACTION_WIDTH / 2, d.size
            );
        })
        .attr('fill', function(d) { return d3.color(d._color).darker(.5); });

    groups.append('path')
        .attr('d', function(d) {
            return 'M{0},{1}L{2},{3}L{4},{5}L{6},{7}z'.format(
                -FRACTION_WIDTH / 2, 0,
                -FRACTION_WIDTH / 2 - FRACTION_LEVEL_X, FRACTION_LEVEL_Y,
                -FRACTION_WIDTH / 2 - FRACTION_LEVEL_X, d.size + FRACTION_LEVEL_Y,
                -FRACTION_WIDTH / 2, d.size
            );
        })
        .attr('fill', function(d) { return d3.color(d._color).darker(.5); });

    groups.filter(function(d) { return d.partyId == 8; }).append('path')
        .attr('d', function(d) {
            return 'M{0},{1}L{2},{3}L{4},{5},L{6},{7}z'.format(
                FRACTION_WIDTH / 2, d.size,
                FRACTION_WIDTH / 2 + FRACTION_LEVEL_X, d.size + FRACTION_LEVEL_Y,
                -FRACTION_WIDTH / 2 - FRACTION_LEVEL_X, d.size + FRACTION_LEVEL_Y,
                -FRACTION_WIDTH / 2, d.size
            );
        })
        .attr('fill', function(d) { return d3.color(d_parties[d.partyId].color).darker(1); });
}


function draw() {
    dom.svg = d3.select('svg');
    dom.convocations = dom.svg.select('.convocations');
    dom.fractions = dom.svg.select('.fractions');
    dom.transitionsDirect = dom.svg.select('.transitions .direct');
    dom.transitionsJump = dom.svg.select('.transitions .jump');

    drawConvocations();
    drawFractions();
    drawTransitions();
}

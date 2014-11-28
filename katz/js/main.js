var container,
    dataContainer,
    axisesContainer,
    mainAxis,
    levelContainer,
    levelContainer2,
    levelText,
    levelText2,
    levelAdditionalText,
    levelAdditionalText2,
    levelTextR,
    levelTextR2,
    levelAdditionalTextR,
    levelAdditionalTextR2,
    ageContainer,
    agePointer,
    horizontalAxises,
    allColumns,
    maleColumns,
    femaleColumns,
    showAllMode = true;

var columnWidth = 10,
    maxColumnHeight = 200,
    minAge,
    maxAge,
    maxMoney;

//window.onload = draw;
window.onresize = onResize;

function onResize() {
    var svg = document.getElementById('svgContainer')
    width = svg.offsetWidth;
    height = svg.offsetHeight;
    if (height / 2 < maxColumnHeight + 50)
        height = 2 * (maxColumnHeight + 50);

    var dX = (width - (maxAge - minAge) * columnWidth) / 2;

    container.attr('transform', 'translate(0,' + (height / 2) + ')');
    dataContainer.attr('transform', 'translate(' + dX + ',0)');
    ageContainer.attr('transform', 'translate(' + dX + ',0)');
    horizontalAxises.attr('transform', 'translate(' + dX + ',0)');

    mainAxis.attr('x2', width - 30);
    axisesContainer.select('polygon')
        .attr('points', (width - 30) + ',0 ' + (width - 37) + ',7 ' + (width - 37) + ',0');

    levelContainer.select('line').attr('x2', width);
    levelContainer2.select('line').attr('x2', width);

    dataContainer.selectAll('.background')
        .attr('y', -height/2)
        .attr('height', height);

    levelText.attr('x', dX - 2 * columnWidth - 9);
    levelText2.attr('x', dX - 2 * columnWidth - 9);
    levelAdditionalText.attr('x', dX - 2 * columnWidth - 9);
    levelAdditionalText2.attr('x', dX - 2 * columnWidth - 9);
    levelTextR.attr('x', dX - 2 * columnWidth);
    levelTextR2.attr('x', dX - 2 * columnWidth);
    levelAdditionalTextR.attr('x', dX - 2 * columnWidth);
    levelAdditionalTextR2.attr('x', dX - 2 * columnWidth);
}

function draw() {
    container = d3.select('#graph #container');
    dataContainer = container.select('#data');
    axisesContainer = container.select('#axises');
    horizontalAxises = axisesContainer.select('#horizontalAxises');
    levelContainer = axisesContainer.select('#level').attr('opacity', 0);
    levelContainer2 = axisesContainer.select('#level2').attr('opacity', 0);
    ageContainer = axisesContainer.select('#agePointer');

    maxMoney = Math.max.apply(null, genderData.map(function(d) { return d.sum }));
    minAge = Math.min.apply(null, genderData.map(function(d) { return d.age }));
    maxAge = Math.max.apply(null, genderData.map(function(d) { return d.age }));


    drawAxis();
    drawLevel();
    drawAgePointer();
    drawData();

    d3.select('#allButton').on('click', showAll);
    d3.select('#genderButton').on('click', showGender);

    onResize();
}

function drawVerticalAxis(age) {
    var x = (age - minAge) * columnWidth;
        horizontalAxises.append('line')
            .classed('axis', true)
            .attr('x1', x)
            .attr('y1', 0)
            .attr('x2', x)
            .attr('y2', 5);
        horizontalAxises.append('text')
            .attr('x', x)
            .attr('y', 12)
            .text(age);
}

function drawLevel(dX) {
    levelContainer.append('line')
        .attr('opacity', 0)
        .classed('level', true)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('y2', 0);

    levelText = levelContainer.append('text')
        .attr('y', -6);
    levelTextR = levelContainer.append('text')
        .classed({ rouble: true })
        .attr('y', -6)
        .text('a');

    levelAdditionalText = levelContainer.append('text')
        .classed('additional', true)
        .attr('y', -21);
    levelAdditionalTextR = levelContainer.append('text')
        .classed({ rouble: true, additional: true })
        .attr('y', -21)
        .text('a');


    levelContainer2.append('line')
        .attr('opacity', 0)
        .classed('level', true)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('y2', 0);

    levelText2 = levelContainer2.append('text')
        .attr('y', 14);
    levelTextR2 = levelContainer2.append('text')
        .classed({ rouble: true })
        .attr('y', 14)
        .text('a');

    levelAdditionalText2 = levelContainer2.append('text')
        .classed('additional', true)
        .attr('y', 28);
    levelAdditionalTextR2 = levelContainer2.append('text')
        .classed({ rouble: true, additional: true })
        .attr('y', 28)
        .text('a');
}

function drawAgePointer() {
    agePointer = ageContainer.append('text')
        .attr('opacity', 0)
        .attr('y', 12)
        .attr('x', 0);
}

function drawAxis() {
    mainAxis = axisesContainer.append('line')
        .classed('axis', true)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('y2', 0);

    axisesContainer.append('polygon')
        .classed('axis', true);

    drawVerticalAxis(minAge);
    drawVerticalAxis(maxAge);
    for (var i = minAge + (10 - minAge % 10); i <= maxAge; i += 10)
        drawVerticalAxis(i);
}

function showAll() {
    showAllMode = true;
    d3.select('#allButton').classed('active', true);
    d3.select('#genderButton').classed('active', false);
    allColumns.attr('opacity', 1);
    maleColumns.attr('opacity', 0);
    femaleColumns.attr('opacity', 0);
}

function showGender() {
    showAllMode = false;
    d3.select('#allButton').classed('active', false);
    d3.select('#genderButton').classed('active', true);
    allColumns.attr('opacity', 0);
    maleColumns.attr('opacity', 1);
    femaleColumns.attr('opacity', 1);
}

function setLevel(d) {
    var y = d.sum ? -d.sum / maxMoney * maxColumnHeight - 2: 0;
    var value = d.sum;
    var averageValue = d.sum / d.count;
    var count = d.count;

    if (!showAllMode) {
        y = d.male.sum ? -d.male.sum / maxMoney * maxColumnHeight - 2: 0;
        value = d.male.sum;
        averageValue = d.male.sum / d.male.count;
        count = d.male.count;

        var y2 = d.female.sum ? d.female.sum / maxMoney * maxColumnHeight + 2: 0;
        var value2 = d.female.sum;
        var averageValue2 = d.female.sum / d.female.count;
        var count2 = d.female.count;

        levelContainer2
            .attr('opacity', 1)
            .attr('transform', 'translate(0,' + y2 + ')');
        levelText2.text('Всего: ' + value2.formatMoney(0, ',', ' '));
        levelAdditionalText2.text('Платежей: ' + count2 + ', средний: ' +
            averageValue2.formatMoney(0, ',', ' '));
    }
    else
        levelContainer2
            .attr('opacity', 0);

    levelContainer
        .attr('opacity', 1)
        .attr('transform', 'translate(0,' + y + ')');
    levelText.text('Всего: ' + value.formatMoney(0, ',', ' '));
    levelAdditionalText.text('Платежей: ' + count + ', средний: ' +
        averageValue.formatMoney(0, ',', ' '));

    agePointer
        .attr('opacity', 1)
        .attr('x', (d.age - minAge) * columnWidth)
        .text(d.age);
}

function drawData() {
    var columns = dataContainer.selectAll('.column')
            .data(genderData.reverse())
        .enter().append('g')
            .classed({ column: true })
            .attr('transform', function(d) {
                var x = (d.age - minAge) * columnWidth;
                return 'translate(' + x + ',0)';
            })
            .on('mouseover', setLevel)
            .on('mouseclick', setLevel)
            .on('mouseout', function(d) {
                agePointer.attr('opacity', 0);
                levelContainer.attr('opacity', 0);
                levelContainer2.attr('opacity', 0);
            });


    columns.append('rect')
        .classed({ background: true })
        .attr('width', columnWidth);

    allColumns = columns.append('g')
        .classed('numberContainer', true);
    allColumns.append('rect')
        .classed({ number: true, allNumber: true })
        .attr('width', columnWidth)
        .attr('height', function(d) {
            return d.sum ? d.sum / maxMoney * maxColumnHeight + 2 : 0;
        })
        .attr('y', function(d) { return -d.sum / maxMoney * maxColumnHeight - 2; });
    allColumns.append('rect')
        .classed({ averageNumber: true })
        .attr('width', columnWidth)
        .attr('height', function(d) {
            return d.sum ? d.sum / d.count / maxMoney * maxColumnHeight + 2 : 0;
        })
        .attr('y', function(d) { return d.sum ?  -d.sum / d.count / maxMoney * maxColumnHeight - 2 : 0; });

    maleColumns = columns.append('g')
        .classed('numberContainer', true)
        .attr('opacity', 0);
    maleColumns.append('rect')
        .classed({ number: true, maleNumber: true })
        .attr('width', columnWidth)
        .attr('height', function(d) {
            return d.male.sum ? d.male.sum / maxMoney * maxColumnHeight + 2 : 0;
        })
        .attr('y', function(d) { return -d.male.sum / maxMoney * maxColumnHeight - 2; });
    maleColumns.append('rect')
        .classed({ averageNumber: true })
        .attr('width', columnWidth)
        .attr('height', function(d) {
            return d.male.sum ? d.male.sum / d.male.count / maxMoney * maxColumnHeight + 2 : 0;
        })
        .attr('y', function(d) { return d.male.sum ? -d.male.sum / d.male.count / maxMoney * maxColumnHeight - 2 : 0; });

    femaleColumns = columns.append('g')
        .classed('numberContainer', true)
        .attr('opacity', 0);
    femaleColumns.append('rect')
        .classed({ number: true, femaleNumber: true })
        .attr('width', columnWidth)
        .attr('height', function(d) {
            return d.female.sum ? d.female.sum / maxMoney * maxColumnHeight + 2 : 0;
        })
        .attr('y', 0);
    femaleColumns.append('rect')
        .classed({ averageNumber: true })
        .attr('width', columnWidth)
        .attr('height', function(d) {
            return d.female.sum ? d.female.sum / d.female.count / maxMoney * maxColumnHeight + 2 : 0;
        })
        .attr('y', 0);
}

Number.prototype.formatMoney = function(c, d, t){
    var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };
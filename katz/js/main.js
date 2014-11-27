var width,
    height,
    container,
    dataContainer,
    axisesContainer,
    levelContainer,
    levelText,
    ageContainer,
    agePointer,
    horizontalAxises;

var columnWidth = 10,
    maxColumnHeight = 200,
    minAge,
    maxAge,
    maxMoney;

window.onload = draw;
window.onresize = draw

function draw() {
    container = d3.select('#graph #container');
    dataContainer = container.select('#data');
    axisesContainer = container.select('#axises');
    horizontalAxises = axisesContainer.select('#horizontalAxises');
    levelContainer = axisesContainer.select('#level');
    ageContainer = axisesContainer.select('#agePointer');

    dataContainer.text('');

    var svg = document.getElementById('graph')
    width = svg.offsetWidth;
    height = svg.offsetHeight;

    maxMoney = Math.max.apply(null, genderData.map(function(d) { return d.all }));
    minAge = Math.min.apply(null, genderData.map(function(d) { return d.age }));
    maxAge = Math.max.apply(null, genderData.map(function(d) { return d.age }));

    var dX = (width - (maxAge - minAge) * columnWidth) / 2;

    drawAxis();
    drawLevel(dX);
    drawAgePointer();
    drawData();

    container.attr('transform', 'translate(0,' + (height / 2) + ')');
    dataContainer.attr('transform', 'translate(' + dX + ',0)');
    ageContainer.attr('transform', 'translate(' + dX + ',0)');
    horizontalAxises.attr('transform', 'translate(' + dX + ',0)');
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
        .attr('x2', width)
        .attr('y2', 0);

    levelText = levelContainer.append('text')
        .attr('y', -4)
        .attr('x', dX - columnWidth);
}

function drawAgePointer() {
    agePointer = ageContainer.append('text')
        .attr('opacity', 0)
        .attr('y', 12)
        .attr('x', 0)
        .text('123');
}

function drawAxis() {
    axisesContainer.append('line')
        .classed('axis', true)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', 0);

    drawVerticalAxis(minAge);
    drawVerticalAxis(maxAge);
    for (var i = minAge + (10 - minAge % 10); i <= maxAge; i += 10)
        drawVerticalAxis(i);
}

function setLevel(d) {
    var y = d.all ? -d.all / maxMoney * maxColumnHeight - 3: 0;
    levelContainer
        .attr('opacity', 1)
        .attr('transform', 'translate(0,' + y + ')');
    levelText.text(d.all.formatMoney(0, ',', ' ') + 'a');

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
                var y = -height / 2;
                return 'translate(' + x + ',' + y + ')';
            })
            .on('mouseover', setLevel)
            .on('mouseclick', setLevel)
            .on('mouseout', function(d) {
                agePointer.attr('opacity', 0);
                levelContainer.attr('opacity', 0);
            });


    columns.append('rect')
        .classed({ background: true })
        .attr('width', columnWidth)
        .attr('height', height)
        .attr('y', 0);

    columns.append('rect')
        .classed({ number: true, allNumber: true })
        .attr('width', columnWidth)
        .attr('height', function(d) {
            return d.all ? d.all / maxMoney * maxColumnHeight + 2 : 0;
        })
        .attr('y', function(d) { return height / 2 - d.all / maxMoney * maxColumnHeight - 2; });
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
var img;  // Declare variable 'img'.

var WIDTH = 650,
    HEIGHT = 300,
    INIT_MAX_SPEED = 3,

    POINT_COUNT,
    LINES_COUNT,
    ITERATION_COUNT;


function grabParams() {
    LINES_COUNT = document.getElementById('lineCount').value;
    POINT_COUNT = document.getElementById('pointCount').value;
    ITERATION_COUNT = document.getElementById('iterationCount').value;
}


function setup() {
    createCanvas(WIDTH, HEIGHT);
    
    var inputs = document.querySelectorAll('#controls input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("input", clearAndDraw, false);
    }
    document.querySelector('#controls button').addEventListener("click", clearAndDraw, false);

    clearAndDraw();
}

function clearAndDraw() {
    console.log('clear and draw');

    fill(10, 10, 10);
    rect(0, 0, WIDTH, HEIGHT);

    grabParams();
    drawBg();
}

function init(hue) {
    colorMode(HSB, 255);

    var points = [];
    for (var i = 0; i < POINT_COUNT; i++)
        points.push({
            x: random(WIDTH),
            y: random(HEIGHT),
            angle: random(2 * Math.PI),
            speed: random(INIT_MAX_SPEED)
        });
    return {
        points: points,
        color: color(hue, 100, 100, 10)
    }
}

function doStep(points) {
    for (var i = 0; i < points.length; i++) {
        points[i].x += sin(points[i].angle) * points[i].speed;
        points[i].y += cos(points[i].angle) * points[i].speed;
    }
}

function drawPoints(points, color) {
    stroke(color);
    noFill();
    beginShape();
    curveVertex(points[0].x, points[0].y);
    for (var i = 0; i < points.length; i++)
        curveVertex(points[i].x, points[i].y);
    curveVertex(points[i - 1].x, points[i - 1].y);
    endShape();
}

function drawBg() {
    var lines = [];
    for (var i = 0; i < LINES_COUNT; i++)
        lines.push(init(random(255)));
    
    for (var l = 0; l < lines.length; l++)
        for (var i = 0; i < ITERATION_COUNT; i++) {
            drawPoints(lines[l].points, lines[l].color);
            doStep(lines[l].points);
        }
}

function draw() {
}
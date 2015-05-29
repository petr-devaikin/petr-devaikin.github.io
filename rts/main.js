var img;  // Declare variable 'img'.
var lines = [];

var WIDTH = 650,
    HEIGHT = 300,
    INIT_MAX_SPEED = 3,

    NOISE_MAX_R = 30,
    NOISE_COUNT = 500,

    params = {};


function grabIntParam(inputId) {
    return parseInt(document.getElementById(inputId).value);
}

function grabParams() {
    params.LINES_COUNT = grabIntParam('lineCount');
    params.POINT_COUNT = grabIntParam('pointCount');
    params.ITERATION_COUNT = grabIntParam('iterationCount');
    params.SPOT_BRIGHTNESS = grabIntParam('spotBrightness');
}


function setup() {
    createCanvas(WIDTH, HEIGHT);
    
    var inputs = document.querySelectorAll('#controls input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("input", function() {
            grabParams();
            generatePath();
            clearAndDraw();
        });
    }

    document.querySelector('#changeShape').addEventListener("click", function() {
        generatePath();
        clearAndDraw();
    });

    document.querySelector('#changeColor').addEventListener("click", function() {
        changeColor();
        clearAndDraw();
    });

    document.querySelector('#changeAll').addEventListener("click", function() {
        generatePath();
        changeColor()
        clearAndDraw();
    });

    clearAndDraw();


    grabParams();
    generatePath();
    changeColor()

    clearAndDraw();
}

function clearCanvas() {
    smooth();
    colorMode(RGB, 255);
    fill(10, 10, 10);
    rect(0, 0, WIDTH, HEIGHT);
}

function clearAndDraw() {
    console.log('clear and draw');
    clearCanvas();
    drawPath();
}

function initLine() {
    var points = [];
    for (var i = 0; i < params.POINT_COUNT; i++)
        points.push({
            angle: random(2 * Math.PI),
            speed: random(INIT_MAX_SPEED),
            steps: [{
                x: random(WIDTH),
                y: random(HEIGHT)
            }],
        });
    return {
        points: points,
        color: undefined
    }
}

function changeColor() {
    colorMode(HSB, 255);
    for (var l = 0; l < lines.length; l++) {
        lines[l].color = color(random(255), 100, 100, 10);
    }
}

function doStep(points) {
    for (var i = 0; i < points.length; i++) {
        var lastPoint = points[i].steps[points[i].steps.length - 1];
        points[i].steps.push({
            x: lastPoint.x + sin(points[i].angle) * points[i].speed,
            y: lastPoint.y + cos(points[i].angle) * points[i].speed,
        });
    }
}

function generatePath() {
    var newLines = [];
    for (var i = 0; i < params.LINES_COUNT; i++) {
        var newLine = initLine();
        if (i < lines.length)
            newLine.color = lines[i].color;
        else
            newLine.color = color(random(255), 100, 100, 10);

        newLines.push(newLine);
    }
    
    for (var l = 0; l < newLines.length; l++)
        for (var i = 0; i < params.ITERATION_COUNT; i++) {
            doStep(newLines[l].points);
        }

    lines = newLines;
}

function addNoise() {
    colorMode(RGB, 255);

    for (var i = 0; i < NOISE_COUNT; i++) {
        fill(0, 0, 0, params.SPOT_BRIGHTNESS);
        noStroke();
        ellipse(
            random(WIDTH),
            random(HEIGHT),
            randomGaussian(NOISE_MAX_R, NOISE_MAX_R / 3),
            randomGaussian(NOISE_MAX_R, NOISE_MAX_R / 3)
        );
    }
}

function drawLines(points, step, color) {
    stroke(color);
    noFill();
    beginShape();
    curveVertex(points[0].steps[step].x, points[0].steps[step].y);
    for (var i = 0; i < points.length; i++)
        curveVertex(points[i].steps[step].x, points[i].steps[step].y);
    curveVertex(points[i - 1].steps[step].x, points[i - 1].steps[step].y);
    endShape();
}

function drawPath() {
    for (var i = 0; i < params.ITERATION_COUNT; i++)
        for (var l = 0; l < lines.length; l++) {
            drawLines(lines[l].points, i, lines[l].color);
        }

    addNoise();
}

function draw() {
}
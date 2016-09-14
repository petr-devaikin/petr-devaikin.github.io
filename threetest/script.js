
var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

var DIRECTIONS = {
    top: 0,
    bottom: 1,
    left: 2,
    right: 3
}

var DIST_K = 1;
var SCALE_K = .5;
var CUBE_SIZE = 20;
var X_COUNT = Math.ceil(WIDTH / CUBE_SIZE / DIST_K);
var Y_COUNT = Math.ceil(HEIGHT / CUBE_SIZE / DIST_K);

var ROTATION_TIME = 1;

function rotateAroundWorldAxis(object, axis, radians) {
    var q = new THREE.Quaternion();
    q.setFromAxisAngle(axis, radians);

    var oq = new THREE.Quaternion();
    object.quaternion.copy(oq);

    oq.premultiply(q);
    return oq;
}

var Cube = function(scene) {
    var geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    var material = new THREE.MeshLambertMaterial({
        color: 0xf6f6f6,
    });

    this.obj = new THREE.Mesh(geometry, material);
    this.obj.cubeObj = this;
    this.available = true;
    scene.add(this.obj);

    this.setPosition = function(i, j) {
        this.col = i;
        this.row = j;

        this.obj.position.set(
            (i - X_COUNT / 2 + .5) * CUBE_SIZE * DIST_K,
            (j - Y_COUNT / 2 + .5) * CUBE_SIZE * DIST_K,
            -CUBE_SIZE * DIST_K
        );
    }

    this.rotate = function(direction) {
        if (!this.available)
            return;

        var euler = new THREE.Euler();

        console.log('rotate');

        this.available = false;
        if (direction == DIRECTIONS.top)
            euler.x -= Math.PI / 2;
        else if (direction == DIRECTIONS.bottom)
            euler.x += Math.PI / 2;
        else if (direction == DIRECTIONS.left)
            euler.y -= Math.PI / 2;
        else if (direction == DIRECTIONS.right)
            euler.y += Math.PI / 2;

        var _this = this;

        TweenLite.to(this.obj.rotation, ROTATION_TIME, {
            x: euler.x,
            y: euler.y,
            onComplete: function() {
                _this.obj.rotation.set(0, 0, 0);
                _this.available = true;
            },
            ease: Power2.easeInOut
        });

        TweenLite.to(this.obj.scale, ROTATION_TIME / 2, {
            x: SCALE_K, y: SCALE_K, z: SCALE_K,
            ease: Expo.easeOut
        })
        TweenLite.to(this.obj.scale, ROTATION_TIME / 2, {
            x: 1, y: 1, z: 1,
            delay: ROTATION_TIME / 2,
            ease: Expo.easeIn
        })
    }
}

//

var scene = new THREE.Scene();
var renderer;
var camera;

function setScene() {
    scene.background = new THREE.Color( 0xffffff );
    //var camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
    camera = new THREE.PerspectiveCamera(30, WIDTH / HEIGHT, 1, 2000);
    camera.position.z = 625;

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild( renderer.domElement );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, .05 );
    directionalLight.position.set(0, 0, 50);
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight( 0xffffff, .95 );
    scene.add(ambientLight);
}


var cubes = [];

function getCube(i, j) {
    return cubes[Y_COUNT * i + j];
}

function createCubes() {
    for (var i = 0; i < X_COUNT; i++) {
        for (var j = 0; j < Y_COUNT; j++) {
            var c = new Cube(scene);
            c.setPosition(i, j);
            cubes.push(c);
            //c.rotation.x += Math.random();
        }
    }
}

setScene();
createCubes();


var render = function () {
    requestAnimationFrame( render );

    //cube.rotation.x += 0.1;
    //cube.rotation.y += 0.1;

    renderer.render(scene, camera);
};


var raycaster = new THREE.Raycaster();
function getCubePosition(x, y) {
    var mouse = new THREE.Vector2();
    mouse.x = ( x / WIDTH ) * 2 - 1;
    mouse.y = - ( y / HEIGHT ) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );
    if (intersects.length > 0)
        return [
            intersects[0].object.cubeObj.col,
            intersects[0].object.cubeObj.row
        ]
    else
        return undefined;
}


var lastPosition = undefined;

document.addEventListener('mousemove', (event) => {

    var newPosition = getCubePosition(event.clientX, event.clientY);

    if (newPosition !== undefined) {
        if (lastPosition !== undefined) {

            var cube = getCube(newPosition[0], newPosition[1]);
            if (cube !== undefined && (newPosition[0] != lastPosition[0] || newPosition[1] != lastPosition[1])) {
                var direction;
                var stepI;
                var stepJ;
                var count;

                if (Math.abs(newPosition[0] - lastPosition[0]) > Math.abs(newPosition[1] - lastPosition[1])) {
                    direction = (newPosition[0] - lastPosition[0] > 0) ? DIRECTIONS.right : DIRECTIONS.left;
                    stepI = (newPosition[0] - lastPosition[0] > 0) ? 1 : -1;
                    count = Math.abs(newPosition[0] - lastPosition[0]);
                    stepJ = (newPosition[1] - lastPosition[1]) / count;
                }
                else {
                    direction = (newPosition[1] - lastPosition[1] > 0) ? DIRECTIONS.top : DIRECTIONS.bottom;
                    stepJ = (newPosition[1] - lastPosition[1] > 0) ? 1 : -1;
                    count = Math.abs(newPosition[1] - lastPosition[1]);
                    stepI = (newPosition[0] - lastPosition[0]) / count;
                }

                var i = lastPosition[0];
                var j = lastPosition[1];
                for (var i = 1; i <= count; i++) {
                    var c = getCube(Math.round(lastPosition[0] + stepI * i), Math.round(lastPosition[1] + stepJ * i));
                    //if (c !== undefined)
                        c.rotate(direction);
                }
            }
        }

        lastPosition = newPosition;
    }
}, false);

render();

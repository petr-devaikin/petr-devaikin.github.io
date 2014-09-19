var bigTimer = new TimeMachine();

function TimeMachine() {
    this.animationObjects = {};
    this.timer = undefined;

    this.addObject = function (obj, newOpacity, speed) {
        obj.finalOpacity = newOpacity;
        obj.speed = speed;
        this.animationObjects[obj.aoId] = obj;
        if (Object.keys(this.animationObjects).length == 1 && this.timer == undefined) {
            TimeMachine.lastTime = undefined;
            this.timer = setAnimation(this.getChangeObjectsHandler(this));
        }
    };

    this.getChangeObjectsHandler = function (machine) {
        return function () {
            var currentTime = new Date;
            if (TimeMachine.lastTime !== undefined) {
                var timerPeriod = currentTime - TimeMachine.lastTime;

                var toDelete = [];
                for (var o in machine.animationObjects) {
                    var obj = machine.animationObjects[o];
                    var stepSpeed = timerPeriod / obj.speed * (obj.finalOpacity < obj.currentOpacity ? -1 : 1);
                    var nextOpacity = obj.currentOpacity + stepSpeed;

                    if (stepSpeed < 0 && nextOpacity < obj.finalOpacity)
                        nextOpacity = obj.finalOpacity;
                    else if (stepSpeed > 0 && nextOpacity > obj.finalOpacity)
                        nextOpacity = obj.finalOpacity;

                    if (nextOpacity == obj.finalOpacity)
                        toDelete.push(o);
                    obj.setOpacity(nextOpacity);
                }

                for (var i in toDelete)
                    delete machine.animationObjects[toDelete[i]];

                if (Object.keys(machine.animationObjects).length == 0) {
                    clearAnimation(machine.timer);
                    machine.timer = undefined;
                    //console.log("timer stopped");
                    return;
                }
            }

            setAnimation(machine.getChangeObjectsHandler(machine));

            TimeMachine.lastTime = currentTime;
        };
    }
}

var setAnimation = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback, element) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();


var clearAnimation = (function () {
    return window.cancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame ||
        function(id) {
            clearTimeout(id)
        }
})();

var connections = {};

function Connection(leftFraction, rightFraction, deputats) {
    this.id = Connection.prototype.idsCounter++;
    connections[this.id] = this;

    this.startFraction = leftFraction;
    this.finishFraction = rightFraction;

    if (leftFraction.partyId != rightFraction.partyId)
        this.hint = leftFraction.name + " (" + leftFraction.convocationName + ") → " + rightFraction.name +
            " (" + rightFraction.convocationName + "), " + deputats.length + " деп.";
    else
        this.hint = leftFraction.name + " (" + leftFraction.convocationName + " → " + rightFraction.convocationName + "), " +
            deputats.length + " деп.";

    this.start = [leftFraction.rightSideCoordinates[0], leftFraction.rightSideCoordinates[1]];
    this.finish = [rightFraction.leftSideCoordinates[0], rightFraction.leftSideCoordinates[1]];
    this.personStart = [leftFraction.rightSideCoordinates[0], leftFraction.rightSideCoordinates[1] + deputats.length / 2];
    this.personFinish = [rightFraction.leftSideCoordinates[0], rightFraction.leftSideCoordinates[1] + deputats.length / 2];
    this.count = deputats.length;

    leftFraction.rightSideCoordinates[1] += deputats.length;
    rightFraction.leftSideCoordinates[1] += deputats.length;

    this.gradientName = "grad-" + leftFraction.id + "-" + rightFraction.id;
    this.path = undefined;
    this.gradient = undefined;

    this.personGradientName = "person-grad-" + leftFraction.id + "-" + rightFraction.id;
    this.personPath = undefined;
    this.personGradient = undefined;

    this.leftObj = undefined;
    this.rightObj = undefined;

    this.deputatsIds = deputats;

    this.draw = function (R) {
        this.drawPersonLine(R);

        this.gradient = R.defineLinearGradient(this.gradientName,
            getGradientParams(this.startFraction.color, this.finishFraction.color),
            this.start[0], this.finish[0]);

        this.path = drawConnection(R, this.start, this.finish, this.count, this.hint);
        this.path.strokeLinearGradient(this.gradientName, this.count);

        this.leftObj = new AnimatedObject(AnimatedObject.CONNECTION_END_TYPE,
            this.gradient.childNodes[0], this.startFraction.color);
        this.rightObj = new AnimatedObject(AnimatedObject.CONNECTION_END_TYPE,
            this.gradient.childNodes[1], this.finishFraction.color);

        this.bindEvents();
    };

    this.drawPersonLine = function (R) {
        this.personGradient = R.defineLinearGradient(this.personGradientName,
            getGradientParams(this.startFraction.color, this.finishFraction.color),
            this.start[0], this.finish[0]);

        this.personPath = drawConnection(R, this.personStart, this.personFinish, 1, this.hint);
        this.personPath.strokeLinearGradient(this.personGradientName, 1);

        this.personPath.hide();
    };

    this.bindEvents = function () {
        bindClickToConnection(this.path, this.id);
        bindClickToConnection(this.personPath, this.id);
    };
}

Connection.prototype.idsCounter = 0;
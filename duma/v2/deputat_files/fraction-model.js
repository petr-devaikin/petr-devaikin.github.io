var sortByCount = false;
var fractions = {}; // депутаты фракции

function addFraction(fraction, convocationId) {
    if (fractions[fraction.Id] === undefined) {
        var party = getOrCreateParty(fraction);
        var fr = new Fraction(fraction.Id, fraction.Party.Id, fraction.Party.Name, fraction.Order,
            fraction.DeputatsCount, convocationId);
        party.direct.push(fraction.Id);
        party.addDeputats(fraction.Id, fraction.Deputats);
    }
    return fractions[fraction.Id];
}

function Fraction(id, partyId, name, order, deputatsCount, convocationId) {
    this.id = id;
    fractions[this.id] = this;

    this.partyId = partyId;
    this.name = name;
    this.order = order;
    this.deputatsCount = deputatsCount;
    this.deputatsIds = [];
    this.convocation = convocationId;
    this.convocationName = convocationNames[convocationId];
    this.obj = undefined;
    this.rect = undefined;
    this.connections = { toTheLeft: {}, toTheRight: {} };

    this.hint = this.convocationName + " созыв: " + this.name + ", " + deputatsCount + " деп.";

    this.leftTopCorner = undefined;
    this.leftSideCoordinates = undefined;
    this.rightSideCoordinates = undefined;
    this.color = getPartyColor(partyId);

    this.calcCoordinates = function () {
        this.leftTopCorner = this.getFractionCoordinates();
        this.leftSideCoordinates = [this.leftTopCorner[0], this.leftTopCorner[1]];
        this.rightSideCoordinates = [this.leftSideCoordinates[0] + partyWidth, this.leftSideCoordinates[1]];
    }

    this.getFractionCoordinates = function() {
        var x = getConvocationX(this.convocation) - partyWidth / 2;
        var y = topPadding + maximumDeputats - convocations[this.convocation].DeputatsCount;

        for (var p in convocations[this.convocation].Fractions) {
            if (convocations[this.convocation].Fractions[p].Id != this.id) {
                if (sortByCount) {
                    if (convocations[this.convocation].Fractions[p].DeputatsCount < this.deputatsCount)
                        y += convocations[this.convocation].Fractions[p].DeputatsCount + partyMargin;
                }
                else
                    if (convocations[this.convocation].Fractions[p].Order < this.order)
                        y += convocations[this.convocation].Fractions[p].DeputatsCount + partyMargin;
            }
        }

        return [x, y];
    }

    this.addConnectionToTheRight = function (fractionRightId, connection) {
        this.connections.toTheRight[fractionRightId] = connection;
    }

    this.addConnectionToTheLeft = function (fractionLeftId, connection) {
        this.connections.toTheLeft[fractionLeftId] = connection;
    }

    this.tryToAddDeputat = function (id) {
        if (findElementInArray(id, this.deputatsIds) == -1)
            this.deputatsIds.push(id);
    };

    this.draw = function (R) {
        var rect = drawFraction(R, this.leftTopCorner,
            deputatsCount, getPartyColor(partyId), this.hint);
        this.obj = new AnimatedObject(AnimatedObject.FRACTION_TYPE, rect, this.color);
        this.rect = rect;

        this.bindEvents();

        return rect;
    }

    this.bindEvents = function () {
        bindClickToFraction(this.rect, this.id);
    };
}
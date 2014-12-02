var mskCentreLat = 55.719,
    mskCentreLong = 37.6155600,
    defaultZoom = 15;

function toPixelPosition(latitude, longitude) {
    var kmInLat = 111.35,
        kmInLong = 62.79;

    return {
        x: toPixelSize((longitude - mskCentreLong) * kmInLong),
        y: -toPixelSize((latitude - mskCentreLat) * kmInLat),
    }
}

function toPixelSize(a) {
    return a * defaultZoom;
}
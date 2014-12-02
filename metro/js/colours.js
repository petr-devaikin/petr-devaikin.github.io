function getColourOfTheYear(year, min, max) {
    var hue = parseInt(240 * (year - min) / (max - min));
    return 'hsl(' + hue + ',100%,50%)';
}
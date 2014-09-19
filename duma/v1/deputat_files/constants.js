var width = 0;
var drawingWidth = 0;
var height = 580;
var topPadding = 5;
var partyMargin = 0;
var partyWidth = 10;
var convocationsCount = 6;
var convocationWidth = 20;
var maximumDeputats = 490;

var convLabelsTop = 510;

var canvasId = "diagram-container";
var convocationTextStyle = { "font-family": "Arial", "font-size": 10, fill: "#999" };

var shownOpacity = 1;
var mutedOpacity = 0.35;
var hiddenOpacity = 0.05;

var showAnimationTime = 200;
var hideAnimationTime = 200;

var convocationNames = {
    0: "I",
    1: "II",
    2: "III",
    3: "IV",
    4: "V",
    5: "VI"
};

var partyColors = {
    1: { name: "Аграрная партия России", color: "rgb(163,255,106)" },
    2: { name: "ЛДПР", color: "rgb(115,185,224)" },
    3: { name: "Яблоко", color: "rgb(9,122,22)" },
    4: { name: "Стабильность", color: "rgb(62,169,172)" },
    5: { name: "Новая региональная политика - Дума-96", color: "rgb(102,0,111)" },
    6: { name: "Выбор России", color: "rgb(235,118,118)" },
    7: { name: "Независимые", color: "rgb(200,202,196)" },
    8: { name: "КПРФ", color: "rgb(213,2,0)" },
    9: { name: "Партия российского единства и согласия", color: "rgb(160,224,214)" },
    10: { name: "Женщины России", color: "rgb(245,109,205)" },
    11: { name: "России", color: "rgb(222,219,180)" },
    12: { name: "Демократическая партия России", color: "rgb(166,68,164)" },
    13: { name: "Российские регионы", color: "rgb(83,134,151)" },
    14: { name: "Народовластие", color: "rgb(202,104,134)" },
    15: { name: "Наш дом - Россия", color: "rgb(171,115,69)" },
    16: { name: "Аграрная депутатская группа", color: "rgb(128,216,120)" },
    17: { name: "Народный депутат", color: "rgb(109,111,131)" },
    18: { name: "Отечество - Единая Россия", color: "rgb(174,135,214)" },
    19: { name: "Единство - Единая Россия", color: "#AAA6FF" },
    20: { name: "Регионы России", color: "#B4D351" },
    21: { name: "Агропромышленная депутатская группа", color: "rgb(98,185,126)" },
    22: { name: "СПС", color: "rgb(3,148,211)" },
    23: { name: "Единая Россия", color: "rgb(0,83,160)" },
    24: { name: "Родина", color: "rgb(255,251,98)" },
    25: { name: "Справедливая Россия", color: "rgb(250,181,18)" }
};
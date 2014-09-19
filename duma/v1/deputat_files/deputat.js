//var chartContainer = undefined;


window.onload = function () {
    var t1 = new Date;
    markFirstLetterOfDeputat();

    var canvas = document.getElementById(canvasId);
    width = canvas.offsetWidth;
    drawingWidth = width - 60;

    console.log(new Date - t1); // 2
    t1 = new Date;

    bindPartiesBubblesEvents();
    bindDeputatsEvents();

    console.log(new Date - t1); // 49
    t1 = new Date;
    
    console.log(new Date - t1); // 27
    t1 = new Date;

    draw();

    console.log(new Date - t1); // 57
    t1 = new Date;

    for (var i in parties) {
        showPartyBubble(i);
    }

    //chartContainer = document.getElementById("diagram-parties-container");

    console.log(new Date - t1); // 7
};

//window.onscroll = function () {
//    var windowBottom = window.pageYOffset + window.innerHeight;
//    var partiesBottom = chartContainer.offsetHeight;
//    if (windowBottom > partiesBottom) {
//        if (chartContainer.offsetHeight > window.innerHeight)
//            chartContainer.classList.add("bottom-fixed");
//        else
//            chartContainer.classList.add("top-fixed");
//        chartContainer.classList.add("fixed");
//    }
//    else {
//        chartContainer.classList.remove("fixed");
//        chartContainer.classList.remove("top-fixed");
//        chartContainer.classList.remove("bottom-fixed");
//    }
//}

// help
function removeFromArray(arrayName, arrayElement) {
    for (var i = 0; i < arrayName.length; i++) {
        if (arrayName[i] == arrayElement)
            arrayName.splice(i, 1);
    }
}

function findElementInArray(element, array) {
    for (var i = 0; i < array.length; i++)
        if (array[i] == element)
            return i;
    return -1;
}
$(function() {
    $(window).on('resize', function(){
        setPageSize();
        setBgSize();
        detectBackground();
    });

    $(window).on('scroll', function() {
        detectBackground();
    });

    setPageSize();
    setBgSize();
    detectBackground();

    var img1 = new Image();
    var img2 = new Image();
    var img3 = new Image();
    var img4 = new Image();
    img1.src = 'img/p1.png';
    img2.src = 'img/p2.png';
    img3.src = 'img/p3.png';
    img4.src = 'img/p4.png';
});

function setPageSize() {
    $('.page').css('height', $(window).height());
    var videoHeight = $(window).height() - 100;
    $('#video').css('height', videoHeight);
    $('#video').css('width', videoHeight / 281 * 500);
}

function setBgSize() {
    var height = $(window).height();
    if (height > 800) height = 800;
    var margin = ($(window).height() - height) / 2 + 10;
    $('#background').css('top', margin);
    $('#background').css('bottom', margin);
}

var currentPage;

function detectBackground() {
    var page = undefined;

    $('.page').each(function() {
        if ($(this).offset().top <= $(window).scrollTop() + $(window).height() / 2)
            page = $(this);
    });

    var pageTop = $(window).scrollTop() - page.offset().top + $(window).height() / 2;

    var opacity = Math.min(pageTop, $(window).height() - pageTop);
    if (opacity > $(window).height() / 3)
        opacity = $(window).height() / 3;
    opacity /= $(window).height() / 3;
    $('#background').css('opacity', opacity);

    if (currentPage === undefined || currentPage.attr('id') != page.attr('id')) {
        setCurrentPage(page);
    }

    var p5_top = $('#page_5').offset().top;
    if ($(window).scrollTop() + $(window).height() > p5_top) {
        var bg_top = 0 + 50 * ($(window).scrollTop() + $(window).height() - p5_top) / 2 / $(window).height();
        $('#page_5').css('background-position', 'center ' + bg_top + '%');
    }
}

function setCurrentPage(newPage) {
    currentPage = newPage;
    $('#background').css('background-image', 'url(' + currentPage.attr('bg') + ')');
}

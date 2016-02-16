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
});

function setPageSize() {
    $('.page').css('height', $(window).height());
    var videoHeight = $(window).height() - 200;
    $('#video').attr('height', videoHeight);
    $('#video').attr('width', videoHeight / 281 * 500);
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
        if ($(this).offset().top - $(window).height() / 2 <= $(window).scrollTop())
            page = $(this);
    });

    if (currentPage === undefined || currentPage.attr('id') != page.attr('id')) {
        setCurrentPage(page);
    }
}

function setCurrentPage(newPage) {
    currentPage = newPage;
    $('#background').stop();
    $('#background').animate({
            opacity: 0
        }, 500, function() {
            if (currentPage.attr('bg') !== undefined) {
                $('#background').css('background-image', 'url(' + currentPage.attr('bg') + ')');
                $('#background').animate({
                        opacity: 0.7
                    }, 500);
            }
        });
}

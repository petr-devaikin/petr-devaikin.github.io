
var activeDevice = 'mac',
    activePage = 0;


var RATIOS = {
    'mac': { width: 0.725, top: 0.0586, bottom: 0.074 },
    'ipad': { width: 0.60546875, top: 0.0595703125, bottom: 0.0595703125 },
    'iphone': { width: 0.224, top: 0.07421875, bottom: 0.080078125 },
}

var MAX_FRAME_HEIGHT = 568;
var isFullScreen = false;

$(window).bind('load', function() {
    setActiveDevice();
    setActivePage();

    $(window).resize(function() {
        setScreenSize();
        screenFloat();
    });

    $(window).scroll(function() {
        screenFloat();
    })

    $('.screens__bottom__item').click(function() {
        setActiveDevice($(this).attr('for'));
        return false;
    });

    $('.screens__menu__item').click(function() {
        setActivePage($(this).attr('for'));
        return false;
    });
});


function setScreenSize() {
    isFullScreen = false;
    $('.project-container__foreground').attr('style', '');

    var windowHeight = $(window).innerHeight();
    var windowScroll = $(window).scrollTop();
    var screenMenuHeight = $('.screens__menu').outerHeight();
    var bottomHeight = $('.screens__bottom').outerHeight();

    var availableSpace = windowHeight - screenMenuHeight - bottomHeight;
    var frameHeight = (availableSpace > MAX_FRAME_HEIGHT) ? MAX_FRAME_HEIGHT : availableSpace;
    $('.screens__frame').css('height', frameHeight);

    var foregroundHeight = $('.project-container__foreground').height();

    var curtainHeight = 0;
    console.log(foregroundHeight);
    console.log(windowHeight);
    if (foregroundHeight <= windowHeight) {
        isFullScreen = true;
        $('.project-container__foreground').css('position', 'fixed');
        curtainHeight = windowHeight - foregroundHeight;
        $('.project-container__curtain').show().css('height', curtainHeight + 1);
    }
    else {
        isFullScreen = false;
        curtainHeight = 0;
        $('.project-container__curtain').hide();
    }

    var screenTop = $('.screens').position().top;

    var frameWidth = frameHeight * 2048 / 1136;
    var image = $('.project-container__content__img[device=' + activeDevice + ']');
    image.css('width', frameWidth * RATIOS[activeDevice].width);
    image.css('padding-top', frameWidth * RATIOS[activeDevice].top + screenMenuHeight + screenTop);
    image.css('padding-bottom', frameWidth * RATIOS[activeDevice].bottom + curtainHeight + bottomHeight);
}


function screenFloat() {
    if (isFullScreen)
        return;

    var windowPosition = $(window).scrollTop();
    var windowHeight = $(window).innerHeight();

    var foregroundheight = $('.project-container__foreground').height();

    if (foregroundheight < windowPosition + windowHeight)
        $('.project-container__foreground')
            .css('position', 'fixed')
            .css('bottom', 0);
    else
        $('.project-container__foreground')
            .css('position', 'absolute')
            .css('bottom', '');
}


function setActiveDevice(deviceName) {
    $('.screens__frame__device--' + activeDevice).hide();
    $('.project-container__content__img[device=' + activeDevice + '][page=' + activePage + ']').hide();

    if (deviceName !== undefined)
        activeDevice = deviceName;

    $('.screens__bottom__item--active').removeClass('screens__bottom__item--active');
    $('.screens__bottom__item[for=' + activeDevice + ']').addClass('screens__bottom__item--active');

    var device = $('.screens__frame__device--' + activeDevice);

    device.show();
    $('.project-container__content__img[device=' + activeDevice + '][page=' + activePage + ']').css('display', 'block');

    setScreenSize();
    screenFloat();
}


function setActivePage(pageNumber) {
    $('.project-container__content__img[device=' + activeDevice + '][page=' + activePage + ']').hide();

    if (pageNumber !== undefined)
        activePage = pageNumber;

    $('.screens__menu__item--active').removeClass('screens__menu__item--active');
    $('.screens__menu__item[for=' + activePage + ']').addClass('screens__menu__item--active');

    $('.project-container__content__img[device=' + activeDevice + '][page=' + activePage + ']').css('display', 'block');

    setScreenSize();
    screenFloat();
}


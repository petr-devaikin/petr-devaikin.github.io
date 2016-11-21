var THRESHOLD = 100;

$(function() {
    addNewCard();
    addNewCard();
    setPanHandler();

    setButtonsHandler();
});


function setPanHandler() {
    var frontCard = $('.m-card:last');

    var mc = new Hammer(frontCard.get()[0]);
    mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    var currentStatus = undefined;

    mc.on("pan", function(ev) {
        frontCard.removeClass('released');

        frontCard
            .css('left', ev.deltaX)
            .css('top', ev.deltaY)
            .css('-webkit-transform', 'rotate(' + ev.deltaX * 0.05 + 'deg)')
            .css('transform', 'rotate(' + ev.deltaX * 0.05 + 'deg)');


        if (ev.deltaY < -THRESHOLD) {
            if (currentStatus != 'superliked') {
                currentStatus = 'superliked';
                frontCard
                    .addClass('superliked')
                    .removeClass('liked disliked');
            }
        }
        else if (ev.deltaX < -THRESHOLD) {
            if (currentStatus != 'disliked') {
                currentStatus = 'disliked';
                frontCard
                    .addClass('disliked')
                    .removeClass('liked superliked');
            }
        }
        else if (ev.deltaX > THRESHOLD) {
            if (currentStatus != 'liked') {
                currentStatus = 'liked';
                frontCard
                    .addClass('liked')
                    .removeClass('disliked superliked');
            }
        }
        else if (currentStatus !== undefined) {
            currentStatus = undefined;
            frontCard
                .removeClass('superliked liked disliked');
        }

        if (ev.isFinal) {
            startY = undefined;
            if (currentStatus == 'liked')
                likeCard();
            else if (currentStatus == 'disliked')
                dislikeCard();
            else if (currentStatus == 'superliked')
                superlikeCard();
            else {
                frontCard
                    .addClass('released')
                    .css('top', 0)
                    .css('left', 0)
                    .css('-webkit-transform', 'rotate(0deg)')
                    .css('transform', 'rotate(0deg)');
            }
        }
    });

    frontCard.click(function() {
        clickCard();
    })
}

function setButtonsHandler() {
    // close info

    $('.m-button--dislike').click(function() {
        $('.m-card:last').addClass('disliked');
        setTimeout(function() { dislikeCard(); }, 200);
    });

    $('.m-button--like').click(function() {
        $('.m-card:last').addClass('liked');
        setTimeout(function() { likeCard(); }, 200);
    });

    $('.m-button--superlike').click(function() {
        $('.m-card:last').addClass('superliked');
        setTimeout(function() { superlikeCard(); }, 200);
    });
}


function likeCard() {
    console.log('LIKE!');

    $('.m-card:last').animate({
            left: $(window).innerWidth()
        }, 100, function() {
            $(this).remove();
            addNewCard();
            setPanHandler();
        });
}

function dislikeCard() {
    console.log('DISLIKE!');

    $('.m-card:last').animate({
            left: -$(window).innerWidth()
        }, 100, function() {
            $(this).remove();
            addNewCard();
            setPanHandler();
        });
}

function superlikeCard() {
    console.log('SUPERLIKE!');

    $('.m-card:last').animate({
            top: -$(window).innerHeight()
        }, 100, function() {
            $(this).remove();
            addNewCard();
            setPanHandler();
        });
}

function clickCard() {
    console.log('CLICK CARD!');
}

function addNewCard() {
    var data = getNextCard();
    var emptyCard = $('.m-card--empty');
    var newCard = emptyCard.clone();
    newCard.removeClass('m-card--empty');

    $('.m-card__photo', newCard).css('background-image', 'url(' + data.photo + ')');
    $('.m-card__title__inner__name', newCard).text(data.name);
    $('.m-card__title__inner__age', newCard).text(data.age);
    if (data.desc == '')
        $('.m-card__title__inner__desc', newCard).remove();
    else
        $('.m-card__title__inner__desc', newCard).text(data.desc);
    if (data.interests == '')
        $('.m-card__title__inner__interests', newCard).remove();
    else
        $('.m-card__title__inner__interests', newCard).text(data.interests);
    if (data.friends == '')
        $('.m-card__title__inner__friends', newCard).remove();
    else
        $('.m-card__title__inner__friends', newCard).text(data.friends);

    emptyCard.after(newCard);
}

//=========================
var counter = 0;
function getNextCard() {
    return {
        photo: ['img/mattia.jpg', 'img/amy.jpeg'][Math.floor(Math.random() * 2)],
        name: ['Mattia', 'Helena', 'Olga', 'Tobias', 'Alexander'][Math.floor(Math.random() * 5)],
        desc: ['TU Berlin', ''][Math.floor(Math.random() * 2)],
        age: Math.round(Math.random() * 20 + 20),
        interests: Math.round(Math.random() * 5),
        friends: Math.round(Math.random() * 5)
    }
}

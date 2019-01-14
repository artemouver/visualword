let state = {contentHided: false};

window.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // START OF: listenEvents =====
    const listenEvents = (function () {

        function listen () {
            listenHideUnhide();
            listenSubmit();
        }

        function listenHideUnhide () {
            $('.arrow').on('click', function () {
                if (state.contentHided) {
                    unhide();
                } else {
                    hide();
                }
            });
        }

        function hide() {
            const content = $('.content'), arrow = $('.arrow');
            state.contentHided = true;
            content.css('transform', 'translateX(100%)');
            arrow.css('transform', 'scaleX(-1)');
        }

        function unhide() {
            const content = $('.content'), arrow = $('.arrow');
            state.contentHided = false;
            content.css('transform', 'translateX(0)');
            arrow.css('transform', 'scaleX(1)');
        }

        function listenSubmit() {
            $('.form_word').on('submit', function (e) {
                e.preventDefault();
                let word = $('.input_word').val();

                hide();

                $.ajax({
                    type: "POST",
                    url: "/ajax/coefficients",
                    data: "word=" + word,
                    cache: false,
                    success: drawing
                });
            });
        }
        
        function drawing(res) {
            const data = JSON.parse(res);
            console.log(data);
            //todo Женя
        }

        return {
            listen: listen
        }
    }());
    listenEvents.listen();
// ===== END OF: set svg elements
});
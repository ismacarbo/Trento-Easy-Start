// Menu a tendina
(function($) { 
    "use strict";

    // Navigazione
    var app = function () {
        var body = undefined;
        var menu = undefined;
        var init = function init() {
            body = document.querySelector('body');
            menu = document.querySelector('.menu-icon');
            applyListeners();
        };
        var applyListeners = function applyListeners() {
            menu.addEventListener('click', function (e) {
                e.stopPropagation();
                return toggleClass(body, 'nav-active');
            });
            // Chiudere il menu se si clicca fuori
            document.addEventListener('click', function(e) {
                if (body.classList.contains('nav-active') && !menu.contains(e.target)) {
                    body.classList.remove('nav-active');
                }
            });
        };
        var toggleClass = function toggleClass(element, stringClass) {
            if (element.classList.contains(stringClass)) {
                element.classList.remove(stringClass);
            } else {
                element.classList.add(stringClass);
            }
        };
        init();
    }();

    // Toggle tra login e registrazione
    $(document).ready(function(){
        // Mostra la sezione login per default
        $('.login').addClass('active');

        $('#show-register').click(function(e){
            e.preventDefault();
            $('.login').removeClass('active');
            $('.register').addClass('active');
        });

        $('#show-login').click(function(e){
            e.preventDefault();
            $('.register').removeClass('active');
            $('.login').addClass('active');
        });
    });

})(jQuery);
})(jQuery);

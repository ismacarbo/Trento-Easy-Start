(function ($) {
    "use strict";

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
            document.addEventListener('click', function (e) {
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

    const protectedPages = [
        'main.html',
        'cerca-alloggio.html',
        'accommodation.html',
        'eventi.html',
        'notizie.html',
        'servizi.html',
        'trasporti.html',
        'sanita.html',
        'educazione.html'
    ];

    if (protectedPages.some(page => window.location.pathname.endsWith(page))) {
        getUserData();
    }

    async function getUserData() {
        const token = localStorage.getItem('token');
        if (!token) {
            const currentPage = window.location.pathname.split('/').pop();
            const requireAuth = [
                'main.html',
                'cerca-alloggio.html',
                'accommodation.html',
                'eventi.html',
                'notizie.html',
                'servizi.html',
                'trasporti.html',
                'sanita.html',
                'educazione.html'
            ];

            if (requireAuth.includes(currentPage)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Autenticazione Necessaria',
                    text: 'Devi effettuare il login per accedere a questa pagina.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            }
            return;
        }

        try {
            const res = await fetch('/api/auth', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            const data = await res.json();

            if (res.ok) {
                if (window.location.pathname.endsWith('main.html')) {
                    $('#user-name').text(data.name);
                    $('#user-email').text(data.email);
                }
                if (window.location.pathname.endsWith('index.html')) {
                    $('#user-name-index').text(data.name);
                    $('#user-email-index').text(data.email);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: data.msg || 'Errore durante il recupero dei dati utente',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                }).then(() => {
                    window.location.href = 'login.html';
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Errore durante il recupero dei dati utente',
                confirmButtonText: 'OK',
                confirmButtonColor: '#5ea813',
                confirmButtonHover: '#4c871c'
            }).then(() => {
                window.location.href = 'login.html';
            });
        }
    }

    if (window.location.pathname.endsWith('notizie.html')) {
        fetchNews();
    }

    async function fetchNews() {
        try {
            const res = await fetch('/api/news', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 404) {
                $('#news-list').append('<p>Nessuna notizia trovata secondo i filtri applicati.</p>');
                return;
            }

            if (res.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Non Autorizzato',
                    text: 'Non sei autorizzato. Effettua il login.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                }).then(() => {
                    window.location.href = 'login.html';
                });
                return;
            }

            if (!res.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Errore durante il recupero delle notizie.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                });
                return;
            }

            const news = await res.json();
            console.log('Notizie ricevute:', news);

            displayNews(news);
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Errore durante il recupero delle notizie.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#5ea813',
                confirmButtonHover: '#4c871c'
            });
        }
    }

    function displayNews(news) {
        const newsList = $('#news-list');
        newsList.empty();

        if (news.length === 0) {
            newsList.append('<p>Nessuna notizia trovata secondo i filtri applicati.</p>');
            return;
        }

        news.forEach(notizia => {
            const newsItem = `
                <div class="news-item">
                    <h3>${notizia.title}</h3>
                    <p><i class="fas fa-calendar-alt"></i> ${new Date(notizia.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${notizia.link ? `<a href="${notizia.link}" target="_blank">Località</a>` : 'Località non disponibile'}</p>
                    <p>${notizia.description}</p>
                    ${notizia.link ? `<a href="${notizia.link}" target="_blank" class="btn">Leggi di più</a>` : ''}
                </div>
            `;
            newsList.append(newsItem);
        });
    }

    if (window.location.pathname.endsWith('eventi.html')) {
        fetchEvents();
    }

    async function fetchEvents() {
        try {
            const res = await fetch('/api/events', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 404) {
                $('#events-list').append('<p>Nessun evento trovato.</p>');
                return;
            }

            if (res.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Non Autorizzato',
                    text: 'Non sei autorizzato. Effettua il login.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                }).then(() => {
                    window.location.href = 'login.html';
                });
                return;
            }

            if (!res.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Errore durante il recupero degli eventi.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                });
                return;
            }

            const events = await res.json();
            console.log('Eventi ricevuti:', events);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const filteredEvents = events.filter(event => {
                if (!event.date) return false;
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today;
            });

            displayEvents(filteredEvents);
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Errore durante il recupero degli eventi.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#5ea813',
                confirmButtonHover: '#4c871c'
            });
        }
    }

    function displayEvents(events) {
        const eventsList = $('#events-list');
        eventsList.empty();
        if (events.length === 0) {
            eventsList.append('<p>Nessun evento futuro trovato.</p>');
            return;
        }

        events.forEach(event => {
            const eventItem = `
                <div class="event-item">
                    <h2>${event.title}</h2>
                    <p><i class="fas fa-calendar-alt"></i> ${new Date(event.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.link ? `<a href="${event.link}" target="_blank">Località</a>` : 'Località non disponibile'}</p>
                    <p>${event.description}</p>
                    ${event.link ? `<a href="${event.link}" target="_blank" class="btn">Leggi di più</a>` : ''}
                </div>
            `;
            eventsList.append(eventItem);
        });
    }

    function updateAuthUI() {
        const token = localStorage.getItem('token');
        const authLinks = $('#auth-links');

        authLinks.empty();

        if (token) {
            authLinks.append(' | <a href="#" id="logout" class="hover-target">Logout</a>');
        }
    }

    $(document).ready(function () {
        updateAuthUI();

        $(document).on('click', '#logout', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            Swal.fire({
                icon: 'success',
                title: 'Disconnesso',
                text: 'Sei stato disconnesso.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#5ea813',
                confirmButtonHover: '#4c871c'
            }).then(() => {
                updateAuthUI();
                window.location.href = 'index.html';
            });
        });

        $('#show-register').on('click', function (e) {
            e.preventDefault();
            $('.login').removeClass('active');
            $('.register').addClass('active');
        });

        $('#show-login').on('click', function (e) {
            e.preventDefault();
            $('.register').removeClass('active');
            $('.login').addClass('active');
        });

        $('#login-form').on('submit', async function (e) {
            e.preventDefault();

            const email = $('#login-email').val();
            const password = $('#login-password').val();

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Effettuato',
                        text: 'Login effettuato con successo!',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    }).then(() => {
                        updateAuthUI();
                        window.location.href = 'main.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore di Login',
                        text: data.msg || 'Errore durante il login.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Errore durante il login.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                });
            }
        });

        $('#register-form').on('submit', async function (e) {
            e.preventDefault();

            const name = $('#register-name').val();
            const email = $('#register-email').val();
            const password = $('#register-password').val();

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Registrazione Completata',
                        text: 'Registrazione effettuata con successo! Puoi ora effettuare il login.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    }).then(() => {
                        $('.register').removeClass('active');
                        $('.login').addClass('active');
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore di Registrazione',
                        text: data.msg || 'Errore durante la registrazione.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Errore durante la registrazione.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                });
            }
        });

        if (window.location.pathname.endsWith('main.html') && $('#chat-window').length) {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Autenticazione Necessaria',
                    text: 'Devi effettuare il login per accedere alla chat.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                }).then(() => {
                    window.location.href = 'login.html';
                });
                return;
            }

            const socket = io({
                auth: {
                    token: token
                }
            });

            socket.on('connect_error', (err) => {
                console.error('Errore di connessione Socket.io:', err.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Errore di Connessione',
                    text: 'Errore di autenticazione. Effettua il login nuovamente.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                }).then(() => {
                    window.location.href = 'login.html';
                });
            });

            $('#send-button').on('click', function () {
                const userMessage = $('#message').val().trim();

                if (!userMessage) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Messaggio Vuoto',
                        text: 'Per favore, inserisci il messaggio.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    });
                    return;
                }

                const message = `@bot ${userMessage}`;

                socket.emit('chatMessage', message);

                $('#message').val('');
            });

            socket.on('message', function (msg) {
                let userClass = 'user';
                if (msg.user === 'bot') {
                    userClass = 'bot';
                } else if (msg.user === 'admin') {
                    userClass = 'admin';
                }

                $('#chat-messages').append(`
                    <div class="message ${userClass}">
                        <span class="user">${msg.user}:</span>
                        <span class="text">${msg.text}</span>
                    </div>
                `);
                $('#chat-messages').scrollTop($('#chat-messages')[0].scrollHeight);
            });

            $('#message').keypress(function (e) {
                if (e.which === 13) {
                    $('#send-button').click();
                }
            });

            $('#chat-button').on('click', function () {
                $('#chat-window').toggleClass('hidden visible');
            });

            $('#close-chat').on('click', function () {
                $('#chat-window').removeClass('visible').addClass('hidden');
            });
        }
    });

    document.getElementById('current-year').textContent = new Date().getFullYear();

    document.addEventListener('DOMContentLoaded', function () {
        var map = L.map('map').setView([46.074722, 11.121111], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        var currentControl = null;

        var routeInfo = document.getElementById('route-info');
        var routeTime = document.getElementById('route-time');

        document.getElementById('route-form').addEventListener('submit', function (e) {
            e.preventDefault();

            var start = document.getElementById('start').value.trim();
            var destination = document.getElementById('destination').value.trim();

            if (!start || !destination) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Input Mancante',
                    text: 'Per favore, inserisci sia la posizione di partenza che la destinazione.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                });
                return;
            }

            geocodeLocation(start + ', Trento, Italia').then(function (startLatLng) {
                if (!startLatLng) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Posizione Non Trovata',
                        text: 'Posizione di partenza non trovata.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    });
                    return;
                }

                geocodeLocation(destination + ', Trento, Italia').then(function (endLatLng) {
                    if (!endLatLng) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Posizione Non Trovata',
                            text: 'Destinazione non trovata.',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#5ea813',
                            confirmButtonHover: '#4c871c'
                        });
                        return;
                    }

                    if (currentControl) {
                        map.removeControl(currentControl);
                    }

                    var profile = 'driving';

                    currentControl = L.Routing.control({
                        waypoints: [
                            L.latLng(startLatLng[0], startLatLng[1]),
                            L.latLng(endLatLng[0], endLatLng[1])
                        ],
                        routeWhileDragging: true,
                        geocoder: L.Control.Geocoder.nominatim(),
                        router: L.Routing.osrmv1({
                            serviceUrl: 'https://router.project-osrm.org/route/v1',
                            profile: profile
                        }),
                        showAlternatives: false,
                        lineOptions: {
                            styles: [{ color: '#5ea813', weight: 5 }]
                        },
                        addWaypoints: false,
                        draggableWaypoints: false,
                        fitSelectedRoutes: true
                    }).addTo(map);

                    currentControl.on('routesfound', function (e) {
                        var routes = e.routes;
                        if (routes.length > 0) {
                            var route = routes[0];
                            var totalTime = route.summary.totalTime;
                            var formattedTime = formatTime(totalTime);
                            routeTime.textContent = formattedTime;
                            routeInfo.style.display = 'block';
                        }
                    });
                });
            }).catch(function (error) {
                console.error('Errore nella geocodifica:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Si è verificato un errore durante la geocodifica delle posizioni.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                });
            });
        });

        async function geocodeLocation(address) {
            try {
                const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: address,
                        format: 'json',
                        limit: 1
                    }
                });
                if (response.data && response.data.length > 0) {
                    return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
                } else {
                    return null;
                }
            } catch (error) {
                console.error('Errore durante la richiesta di geocodifica:', error);
                return null;
            }
        }

        function formatTime(totalSeconds) {
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = Math.floor(totalSeconds % 60);
            var formatted = '';
            if (hours > 0) {
                formatted += hours + 'h ';
            }
            if (minutes > 0) {
                formatted += minutes + 'm ';
            }
            if (seconds > 0 && hours === 0) {
                formatted += seconds + 's';
            }
            return formatted.trim();
        }
      
    });

    document.addEventListener('DOMContentLoaded', function () {
        var acc = document.getElementsByClassName("accordion");
        for (var i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
            });
        }
    });

})(jQuery);

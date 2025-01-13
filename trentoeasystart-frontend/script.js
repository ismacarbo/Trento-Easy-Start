(function($) { 
    "use strict";

    let userRole = null;

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
                toggleClass(body, 'nav-active');
            });

            document.addEventListener('click', function(e) {
                if (body.classList.contains('nav-active') && !menu.contains(e.target)) {
                    body.classList.remove('nav-active');
                }
            });
        };

        var toggleClass = function toggleClass(element, stringClass) {
            element.classList.toggle(stringClass);
        };

        init();
    }();

    const protectedPages = [
        'main.html',
        'index.html',
        'cerca-alloggio.html',
        'accommodation.html',
        'eventi.html',
        'notizie.html',
        'servizi.html',
        'trasporti.html',
        'sanita.html',
        'educazione.html',
        'admin-dashboard.html'
    ];

    if (protectedPages.some(page => window.location.pathname.endsWith(page))) { 
        getUserData();
    }

    async function getUserData() {
        const token = localStorage.getItem('token');
        const currentPage = window.location.pathname.split('/').pop();

        if (!token) {
            const requireAuth = [
                'main.html',
                'index.html',
                'cerca-alloggio.html',
                'accommodation.html',
                'eventi.html',
                'notizie.html',
                'servizi.html',
                'trasporti.html',
                'sanita.html',
                'educazione.html',
                'admin-dashboard.html'
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
                    window.location.href = '/';
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
                userRole = data.role;

                if (window.location.pathname.endsWith('main.html')) {
                    $('#user-name').text(data.name);
                    $('#user-email').text(data.email);
                }
                if (window.location.pathname.endsWith('index.html')) {
                    $('#user-name-index').text(data.name);
                    $('#user-email-index').text(data.email);
                }
                if (window.location.pathname.endsWith('admin-dashboard.html')) {
                    $('#user-name-admin').text(data.name);
                    $('#user-email-admin').text(data.email);
                }

                updateNavMenu();

                if (currentPage === 'admin-dashboard.html' && userRole !== 'admin') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Accesso Negato',
                        text: 'Non sei autorizzato ad accedere a questa pagina.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    }).then(() => {
                        window.location.href = '/';
                    });
                }

                return data;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: data.msg || 'Errore durante il recupero dei dati utente',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#5ea813',
                    confirmButtonHover: '#4c871c'
                }).then(() => {
                    window.location.href = '/';
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
                window.location.href = '/';
            });
        }
    }

    function updateNavMenu() {
        const navList = $('.nav__list');
        navList.find('.admin-dashboard-link').remove();

        if (userRole === 'admin') {
            const adminLink = `
                <li class="nav__list-item admin-dashboard-link">
                    <a href="admin-dashboard.html" class="hover-target">Admin Dashboard</a>
                </li>
            `;
            navList.append(adminLink);
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
                    window.location.href = '/';
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
                    window.location.href = '/';
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
        const authLinks = $('.multilingua');

        authLinks.empty();

        if (token) {
            authLinks.append(`
                <a href="#" class="hover-target" title="Italiano">🇮🇹</a> |
                <a href="#" class="hover-target" title="Inglese">🇬🇧</a> |
                <a href="#" class="hover-target" title="Tedesco">🇩🇪</a>
                | <a href="#" id="logout" class="hover-target">Logout</a>
            `);
        } else {
            authLinks.append(`
                <a href="#" class="hover-target" title="Italiano">🇮🇹</a> |
                <a href="#" class="hover-target" title="Inglese">🇬🇧</a> |
                <a href="#" class="hover-target" title="Tedesco">🇩🇪</a>
            `);
        }
    }

    $(document).ready(function () {
        updateAuthUI();

        $(document).on('click', '#show-register', function (e) {
            e.preventDefault();
            $('.login').removeClass('active');
            $('.register').addClass('active');
        });

        $(document).on('click', '#show-login', function (e) {
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
                    body: JSON.stringify({ email, password})
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    userRole = data.role;
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Effettuato',
                        text: 'Login effettuato con successo!',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    }).then(() => {
                        updateAuthUI();
                        updateNavMenu();
                        if (data.role === 'user'){
                            window.location.href = 'main.html';
                        }
                        else {
                            window.location.href = 'admin-dashboard.html';
                        }
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

        $(document).on('click', '#logout', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            userRole = null;
            Swal.fire({
                icon: 'success',
                title: 'Disconnesso',
                text: 'Sei stato disconnesso.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#5ea813',
                confirmButtonHover: '#4c871c'
            }).then(() => {
                updateAuthUI();
                updateNavMenu();
                window.location.href = '/';
            });
        });

        if (window.location.pathname.endsWith('chi-siamo.html')){
            $('#feedback-form').on('submit', async function(e){
                e.preventDefault();

                const name = $('#name').val();
                const subject = $("#subject").val();
                const email = $('#email').val();
                const message = $('#message').val();

                if (!name || !subject || !email || !message){
                    Swal.fire({
                        icon: 'error',
                        title: 'Completa tutti i campi',
                        text: 'Completa tutti i campi inserendo valori validi.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    });
                    return;
                }

                try {
                    const res = await fetch('/api/contact/', {
                        method:'POST',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify({ name, email, subject, message })
                    });

                    if (res.ok){
                        const data = await res.json();
                        Swal.fire({
                            icon: 'success',
                            title: 'Messaggio inviato',
                            text: data.msg,
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#5ea813',
                            confirmButtonHover: '#4c871c'
                        });

                        $('#name').val('');
                        $('#email').val('');
                        $('#subject').val('');
                        $('#message').val('');
                    }
                    else {
                        const data = await res.json();
                        Swal.fire({
                            icon: 'error',
                            title: 'Errore nell\'invio del messaggio',
                            text: data.msg || 'Si è verificato un errore durante l\'invio del messaggio. Riprova.',
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
                        text: 'Errore durante l\'invio del messaggio.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    });
                }
            });
        }

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
                    window.location.href = '/';
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
                    window.location.href = '/';
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

        if(window.location.pathname.endsWith('admin-dashboard.html')){
            $('#admin-create').on('click', function() {
                if ($('#create-admin-form').length === 0) {
                    $('#result').html(
                    `<div id="create-admin-section">
                        <h3>Crea un Nuovo Amministratore</h3>
                        <form id="create-admin-form">
                            <input type="text" id="admin-name" placeholder="Nome" required>
                            <input type="email" id="admin-email" placeholder="Email" required>
                            <input type="password" id="admin-password" placeholder="Password" required>
                            <button type="submit" id="create-admin-btn">Crea</button>
                        </form>
                    </div>
                    `) ;

                    $('#create-admin-form').on('submit', async function (e){
                        e.preventDefault();
                        
                        const name = $('#admin-name').val();
                        const email = $('#admin-email').val();
                        const password = $('#admin-password').val();
                
                        try {
                            const res = await fetch('/api/auth/createAdmin', {
                                method: 'POST',
                                headers: {
                                    'Content-Type':'application/json',
                                    'x-auth-token': localStorage.getItem('token')
                                },
                                body: JSON.stringify({name, email, password})
                            });

                            if (res.ok){
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Creazione Admin Completata',
                                    text: 'Registrazione admin ' + email + ' effettuata con successo.',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#5ea813',
                                    confirmButtonHover: '#4c871c'
                                }).then(() => {
                                    $('#create-admin-form')[0].reset();
                                });
                            }
                            else {
                                const data = await res.json();
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Creazione Admin Fallita',
                                    text: data.msg || 'Errore durante la creazione dell\'admin.',
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
                                text: 'Errore durante la creazione dell\'admin.',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#5ea813',
                                confirmButtonHover: '#4c871c'
                            });
                        }
                    });
                }
            });

            $('#view').on('click', async function (){
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('/api/auth/users', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        }
                    });

                    const data = await res.json();
                    if (res.ok) {
                        displayUsers(data);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Errore',
                            text: data.msg || 'Errore durante il recupero degli utenti.',
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
                        text: 'Errore durante il recupero degli utenti.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    });
                }
            });

            $('#view-users').on('click', async function (){
                $('#view').click();
            });

            $('#view-chart').on('click', async function () {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('/api/auth/users/stats', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        }
                    });
        
                    const data = await res.json();

                    if (res.ok) {
                        renderChart(data);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Errore',
                            text: data.msg || 'Errore durante il recupero delle statistiche.',
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
                        text: 'Errore durante il recupero delle statistiche.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#5ea813',
                        confirmButtonHover: '#4c871c'
                    });
                }
            });

            function renderChart(data) {
                if ($('#registration-chart').length === 0) {
                    const chartContainer = `
                        <div class="chart-container" style="width: 100%; height: 400px;">
                            <h3>Grafico degli Utenti Iscritti</h3>
                            <div class="select-container">
                                <select id="time-range" class="styled-select">
                                    <option value="7">Ultima Settimana</option>
                                    <option value="30">Ultimo Mese</option>
                                    <option value="365">Ultimo Anno</option>
                                </select>
                            </div>
                            <canvas id="registration-chart" style="width: 100%; height: 100%;"></canvas>
                        </div>
                    `;
                    $('#result').html(chartContainer);
                }

                function generateRange(range, interval = 'day') {
                    const today = new Date();
                    const rangeArray = [];
                    const startDate = new Date(today);

                    if (interval === 'day') {
                        startDate.setDate(today.getDate() - range + 1);
                        while (startDate <= today) {
                            rangeArray.push(startDate.toISOString().split('T')[0]);
                            startDate.setDate(startDate.getDate() + 1);
                        }
                    } else if (interval === 'month') {
                        const months = Math.ceil(range / 30);
                        startDate.setMonth(today.getMonth() - months + 1);
                        startDate.setDate(1);
                        while (startDate <= today) {
                            const year = startDate.getFullYear();
                            const month = String(startDate.getMonth() + 1).padStart(2, '0');
                            rangeArray.push(`${year}-${month}`);
                            startDate.setMonth(startDate.getMonth() + 1);
                        }
                    }

                    return rangeArray;
                }

                function groupData(data, range) {
                    const isYear = range === 365;
                    const fullRange = generateRange(range, isYear ? 'month' : 'day');

                    const grouped = {};
                    data.forEach(item => {
                        const date = new Date(item._id);
                        let key = isYear
                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                            : item._id;
                        grouped[key] = (grouped[key] || 0) + item.count;
                    });

                    const labels = fullRange;
                    const values = labels.map(label => grouped[label] || 0);

                    return { labels, values };
                }

                function filterData(range) {
                    const today = new Date();
                    const filtered = data.filter(d => {
                        const registrationDate = new Date(d._id);
                        const diffInDays = (today - registrationDate) / (1000 * 60 * 60 * 24);
                        return diffInDays <= range;
                    });

                    return groupData(filtered, range);
                }

                function drawChart(filteredData, range) {
                    const ctx = document.getElementById('registration-chart').getContext('2d');
                    if (window.registrationChart) window.registrationChart.destroy();
                    window.registrationChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: filteredData.labels,
                            datasets: [{
                                label: 'Numero di Iscritti',
                                data: filteredData.values,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderWidth: 2,
                                pointRadius: 3,
                                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                                pointHoverRadius: 5,
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    title: { display: true, text: range === 365 ? 'Mese' : 'Data' },
                                    ticks: {
                                        autoSkip: true,
                                        maxTicksLimit: 20
                                    }
                                },
                                y: {
                                    title: { display: true, text: 'Numero di Utenti' },
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1,
                                        callback: function(value) {
                                            return Number.isInteger(value) ? value : null;
                                        }
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                },
                                tooltip: {
                                    enabled: true
                                }
                            }
                        }
                    });
                }

                drawChart(filterData(7), 7);

                $('#time-range').off('change').on('change', function () {
                    const range = parseInt($(this).val());
                    drawChart(filterData(range), range);
                });
            }

            function displayUsers(users) {
                let table = `
                    <h3>Elenco Utenti</h3>
                    <table border="1" cellpadding="10">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Ruolo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                users.forEach(user => {
                    table += `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td><button class="remove-user-btn" data-email="${user.email}">Rimuovi</button></td>
                        </tr>
                    `;
                });
                table += `
                        </tbody>
                    </table>
                `;
                $('#result').html(table);

                $('.remove-user-btn').off('click').on('click', async function () {
                    const userEmail = $(this).data('email');

                    Swal.fire({
                        title: 'Sei sicuro?',
                        text: `Sei sicuro di voler eliminare l'utente ${userEmail}?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Si, elimina!',
                        cancelButtonText: 'No, annulla',
                        confirmButtonColor: '#5ea813',
                        cancelButtonColor: '#d33',
                        reverseButtons: true
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`/api/auth/users/${userEmail}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'x-auth-token': token
                                    }
                                });

                                const data = await res.json();
                                if (res.ok) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Utente Eliminato',
                                        text: data.msg || 'Utente eliminato con successo.',
                                        confirmButtonText: 'OK',
                                        confirmButtonColor: '#5ea813',
                                        confirmButtonHover: '#4c871c'
                                    }).then(() => {
                                        $('#view-users').click();
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Errore',
                                        text: data.msg || 'Errore durante l\'eliminazione dell\'utente.',
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
                                    text: 'Errore durante l\'eliminazione dell\'utente.',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#5ea813',
                                    confirmButtonHover: '#4c871c'
                                });
                            }
                        } else if (
                            result.dismiss === Swal.DismissReason.cancel
                        ) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Azione Annullata',
                                text: 'L\'utente non è stato eliminato.',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#5ea813',
                                confirmButtonHover: '#4c871c'
                            });
                        }
                    });
                });
            }
        }

        $('#current-year').text(new Date().getFullYear());

        document.addEventListener('DOMContentLoaded', function () {
            var map = L.map('map').setView([46.074722, 11.121111], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            var currentControl = null;

            var routeInfo = document.getElementById('route-info');
            var routeTime = document.getElementById('route-time');

            $('#route-form').on('submit', function (e) {
                e.preventDefault();

                var start = $('#start').val().trim();
                var destination = $('#destination').val().trim();

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

        $(document).ready(function () {
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
    });

})(jQuery);

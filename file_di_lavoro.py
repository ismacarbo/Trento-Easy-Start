/* Stili Generali */
body {
    margin: 0;
    font-family: 'Montserrat', sans-serif;
    background-color: #1f2029;
    background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1462889/pat-back.svg');
    background-position: center;
    background-repeat: repeat;
    background-size: 4%;
    overflow-x: hidden;
    transition: all 300ms linear;
    color: #fff; /* Imposta il colore del testo a bianco di default */
}

/* Link */
a {
    cursor: pointer;
    text-decoration: none;
    color: inherit;
}

/* Header e Menu */
.cd-header {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.6);
    padding: 10px 0;
}

.header-wrapper {
    width: calc(100% - 100px);
    margin: 0 auto;
    max-width: 1200px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Sinistra: Logo e Menu Icon */
.left-side {
    display: flex;
    align-items: center;
}

.logo-wrap {
    margin-left: 20px;
}

.logo-wrap a {
    font-weight: 900;
    font-size: 24px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #fff;
    transition: all 0.3s ease-out;
}

.logo-wrap a span {
    color: #8167a9;
}

/* Menu Icon */
.menu-icon {
    height: 30px;
    width: 30px;
    position: relative;
    z-index: 1001;
    cursor: pointer;
    display: block;
}

.menu-icon__line {
    height: 2px;
    width: 30px;
    display: block;
    background-color: #fff;
    margin-bottom: 7px;
    transition: background-color .5s ease, transform .2s ease;
}

.menu-icon__line-left {
    width: 16.5px;
    transition: all 200ms linear;
}

.menu-icon__line-right {
    width: 16.5px;
    float: right;
    transition: all 200ms linear;
}

.menu-icon:hover .menu-icon__line-left,
.menu-icon:hover .menu-icon__line-right {
    width: 30px;
}

/* Destra: Multilingua */
.multilingua {
    display: flex;
    gap: 10px;
}

.multilingua a {
    color: #fff;
    font-weight: 600;
    transition: color 0.3s;
}

.multilingua a:hover {
    color: #8167a9;
}

/* Menu a Tendina */
.nav {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(9,9,12,0.95);
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.5s ease;
}

body.nav-active .nav {
    visibility: visible;
    opacity: 1;
}

.nav__content {
    position: absolute;
    top: 100px;
    left: 50px;
    right: 50px;
    text-align: center;
}

.nav__list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.nav__list-item {
    margin: 20px 0;
}

.nav__list-item a {
    font-size: 24px;
    color: #fff;
    text-decoration: none;
    transition: color 0.3s;
}

.nav__list-item a:hover {
    color: #8167a9;
}

/* Submenu */
.submenu {
    list-style: none;
    padding: 10px 0 0 0;
    margin: 0;
}

.submenu li {
    margin: 10px 0;
}

.submenu li a {
    font-size: 18px;
    color: #c4c3ca;
}

.submenu li a:hover {
    color: #8167a9;
}

/* Menu Icon Active State */
body.nav-active .menu-icon__line {
    background-color: #fff;
    transform: translateY(12px) rotate(-45deg);
}

body.nav-active .menu-icon__line-left {
    opacity: 0;
}

body.nav-active .menu-icon__line-right {
    transform: translateY(-12px) rotate(45deg);
}

/* Evita la duplicazione della 'X' */
.menu-icon__line-left,
.menu-icon__line-right {
    width: 30px;
}

/* Spostare il contenuto principale verso il basso quando il menu è attivo */
body.nav-active .container {
    transform: translateY(50px);
    transition: transform 0.5s ease;
}

/* Container Principale */
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 150px;
    transition: transform 0.5s ease;
}

/* Form di Login e Registrazione */
.form-container {
    position: relative;
    width: 350px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 50px;
    padding: 40px;
}

.form-container .login,
.form-container .register {
    display: none;
}

.form-container .login.active,
.form-container .register.active {
    display: block;
}

.form-container h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #fff;
}

.form-container form {
    display: flex;
    flex-direction: column;
}

.form-container form input,
.form-container form select,
.form-container form textarea {
    margin-bottom: 15px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.8);
    color: #000;
    font-size: 14px;
}

.form-container form input::placeholder,
.form-container form select::placeholder,
.form-container form textarea::placeholder {
    color: #666;
}

.form-container form button {
    padding: 10px;
    border: none;
    border-radius: 5px;
    background: #8167a9;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
}

.form-container form button:hover {
    background: #6a11cb;
}

.form-container p {
    text-align: center;
    margin-top: 20px;
    color: #fff;
}

.form-container p a {
    color: #8167a9;
    cursor: pointer;
}

.form-container p a:hover {
    text-decoration: underline;
}

/* Sezioni Specifiche */
.support-section,
.contact-section,
.services-section,
.events-section,
.about-section {
    color: #fff; /* Testo bianco per tutte le sezioni */
}

.support-content h2,
.contact-content h2,
.services-content h2,
.events-list h2,
.about-content h2 {
    color: #8167a9; /* Titoli colorati */
}

.faq-item h3,
.contact-details h2,
.service-item h2,
.event-item h2,
.team-member h3 {
    color: #fff; /* Titoli interni */
}

.support-content p,
.contact-content p,
.services-content p,
.event-item p,
.about-content p {
    color: #ddd; /* Testo dei paragrafi */
}

.services-content ul,
.support-content ul,
.contact-content ul {
    list-style: none;
    padding: 0;
}

.services-content ul li,
.support-content ul li,
.contact-content ul li {
    margin-bottom: 10px;
}

.services-content ul li a,
.support-content ul li a,
.contact-content ul li a {
    color: #c4c3ca;
    transition: color 0.3s;
}

.services-content ul li a:hover,
.support-content ul li a:hover,
.contact-content ul li a:hover {
    color: #8167a9;
}

/* Featured Accommodations */
.featured-accommodations h2 {
    color: #8167a9;
    margin-top: 40px;
    margin-bottom: 20px;
}

.accommodation-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

.accommodation-item {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 15px;
    width: 250px;
    text-align: center;
    transition: background 0.3s;
}

.accommodation-item:hover {
    background: rgba(255, 255, 255, 0.2);
}

.accommodation-item img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 10px;
}

.accommodation-item h3 {
    margin: 10px 0;
    color: #fff;
}

.accommodation-item p {
    color: #ddd;
    margin-bottom: 10px;
}

.accommodation-item .btn {
    padding: 8px 16px;
    background: #8167a9;
    color: #fff;
    border-radius: 5px;
    text-decoration: none;
    transition: background 0.3s;
}

.accommodation-item .btn:hover {
    background: #6a11cb;
}

/* Team Members */
.team-members {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.team-member {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 15px;
    width: 200px;
    text-align: center;
    transition: background 0.3s;
}

.team-member:hover {
    background: rgba(255, 255, 255, 0.2);
}

.team-member img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 50%;
}

.team-member h3 {
    margin: 10px 0 5px 0;
    color: #fff;
}

.team-member p {
    color: #ddd;
    margin: 0;
}

/* Responsività */
@media screen and (max-width: 768px) {
    .header-wrapper {
        flex-direction: row;
        justify-content: space-between;
        width: calc(100% - 40px);
        padding: 0 20px;
    }

    .left-side {
        flex-direction: row;
        align-items: center;
    }

    .logo-wrap a {
        font-size: 20px;
    }

    .nav__list-item a {
        font-size: 20px;
    }

    .submenu li a {
        font-size: 16px;
    }

    .accommodation-item {
        width: 100%;
    }

    .team-member {
        width: 100%;
    }
}

@media screen and (max-width: 480px) {
    .header-wrapper {
        flex-direction: column;
        align-items: flex-start;
    }

    .multilingua {
        margin-top: 10px;
    }

    .menu-icon {
        margin-top: 10px;
    }

    .form-container {
        width: 90%;
    }

    .nav__list-item a {
        font-size: 18px;
    }

    .submenu li a {
        font-size: 14px;
    }

    .accommodation-item {
        width: 100%;
    }

    .team-member {
        width: 100%;
    }
}

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Trento Easy Start - Home</title>
    <link rel="stylesheet" href="style.css">
    <!-- Font Awesome per le icone -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Menu di Navigazione -->
    <header class="cd-header">
        <div class="header-wrapper">
            <!-- Sinistra: Logo e Menu Icon -->
            <div class="left-side">
                <div class="menu-icon hover-target">
                    <span class="menu-icon__line menu-icon__line-left"></span>
                    <span class="menu-icon__line"></span>
                    <span class="menu-icon__line menu-icon__line-right"></span>
                </div>
                <div class="logo-wrap">
                    <a href="index.html" class="hover-target"><span>Trento</span>Easy Start</a>
                </div>
            </div>
            <!-- Destra: Multilingua -->
            <div class="multilingua">
                <a href="#" class="hover-target">IT</a> |
                <a href="#" class="hover-target">EN</a> |
                <a href="#" class="hover-target">DE</a>
            </div>
        </div>
    </header>

    <!-- Menu a Tendina -->
    <div class="nav">
        <div class="nav__content">
            <ul class="nav__list">
                <li class="nav__list-item active-nav"><a href="index.html" class="hover-target">Home</a></li>
                <li class="nav__list-item">
                    <a href="cerca-alloggio.html" class="hover-target">Cerca Alloggio</a>
                    <ul class="submenu">
                        <li><a href="cerca-alloggio.html#breve">Affitti Brevi</a></li>
                        <li><a href="cerca-alloggio.html#lungo">Affitti Lunghi</a></li>
                        <li><a href="cerca-alloggio.html#vacanza">Case Vacanza</a></li>
                    </ul>
                </li>
                <li class="nav__list-item">
                    <a href="supporto.html" class="hover-target">Supporto</a>
                    <ul class="submenu">
                        <li><a href="supporto.html#faq">FAQ</a></li>
                        <li><a href="supporto.html#assistenza">Assistenza Clienti</a></li>
                        <li><a href="supporto.html#guide">Guide Utili</a></li>
                    </ul>
                </li>
                <li class="nav__list-item"><a href="contatti.html" class="hover-target">Contatti</a></li>
                <li class="nav__list-item"><a href="servizi.html" class="hover-target">Servizi</a></li>
                <li class="nav__list-item"><a href="mappa-trento.html" class="hover-target">Mappa di Trento</a></li>
                <li class="nav__list-item"><a href="eventi.html" class="hover-target">Eventi</a></li>
                <li class="nav__list-item"><a href="notizie.html" class="hover-target">Notizie</a></li>
                <li class="nav__list-item"><a href="chi-siamo.html" class="hover-target">Chi Siamo</a></li>
            </ul>
        </div>
    </div>

    <!-- Contenitore Principale -->
    <div class="container">
        <!-- Form di Login e Registrazione -->
        <div class="form-container">
            <div class="login active">
                <h2>Login</h2>
                <form>
                    <input type="email" placeholder="Email" required>
                    <input type="password" placeholder="Password" required>
                    <button type="submit">Accedi</button>
                    <p>Non hai un account? <a href="#" id="show-register">Registrati</a></p>
                </form>
            </div>
            <div class="register">
                <h2>Registrazione</h2>
                <form>
                    <input type="text" placeholder="Nome" required>
                    <input type="email" placeholder="Email" required>
                    <input type="password" placeholder="Password" required>
                    <button type="submit">Registrati</button>
                    <p>Hai già un account? <a href="#" id="show-login">Accedi</a></p>
                </form>
            </div>
        </div>
    </div>

    <!-- Script per il Menu e per il toggle del form -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="script.js"></script>

</body>
</html>

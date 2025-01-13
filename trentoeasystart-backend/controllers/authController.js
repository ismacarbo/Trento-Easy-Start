const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMessage } = require('../services/telegramService');

/**
 * Registrazione di un nuovo utente.
 * Invia una notifica al bot Telegram dopo la registrazione.
 */
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validazione dei campi richiesti
    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Per favore, inserisci tutti i campi.' });
    }

    // Validazione del ruolo (se fornito)
    if (role && role !== 'user' && role !== 'admin') {
        return res.status(400).json({ msg: 'Ruolo non valido.' });
    }

    // Controllo dei permessi per la registrazione di un admin
    if (role === 'admin') {
        if (!req.user) {
            return res.status(401).json({ msg: 'Autenticazione necessaria per creare un admin.' });
        }
        const requestingUser = await User.findById(req.user.id).select('-password');
        if (requestingUser.role !== 'admin') {
            return res.status(400).json({ msg: 'Non hai i permessi per registrare un amministratore.' });
        }
    }

    try {
        // Controllo se l'utente esiste già
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Utente già registrato.' });
        }

        // Creazione del nuovo utente
        user = new User({
            role: role || 'user',
            name,
            email,
            password
        });

        // Hash della password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Salvataggio dell'utente nel database
        await user.save();

        // Creazione del payload per il token JWT
        const payload = {
            user: {
                id: user.id,
                name: user.name
            }
        };

        // Generazione del token JWT
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });

                // Invio della notifica Telegram
                const message = `📢 *Nuovo Utente Registrato*\n\n**Nome:** ${name}\n**Email:** ${email}\n**Data:** ${new Date().toLocaleString('it-IT')}`;
                sendMessage(message);
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Login di un utente.
 * Invia una notifica al bot Telegram dopo il login.
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validazione dei campi richiesti
    if (!email || !password) {
        return res.status(400).json({ msg: 'Per favore, inserisci tutti i campi.' });
    }

    try {
        // Ricerca dell'utente nel database
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenziali non valide.' });
        }

        // Verifica della password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenziali non valide.' });
        }

        // Creazione del payload per il token JWT
        const payload = {
            user: {
                id: user.id,
                name: user.name
            }
        };

        console.log('User data:', user);

        // Generazione del token JWT
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ "token": token, "role": user.role });

                // Invio della notifica Telegram
                const message = `🔑 *Utente Effettua il Login*\n\n**Email:** ${email}\n**Data:** ${new Date().toLocaleString('it-IT')}`;
                sendMessage(message);
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Ottiene i dati dell'utente autenticato.
 */
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Crea un nuovo amministratore.
 * Invia una notifica al bot Telegram dopo la creazione di un admin.
 */
exports.createAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    // Validazione dei campi richiesti
    if (!name || !email || !password) {
        console.log(name, email, password);
        return res.status(400).json({ msg: 'Errore nei campi inseriti.' });
    }

    try {
        // Recupero dell'utente che effettua la richiesta
        const requestingUser = await User.findById(req.user.id).select('-password');

        // Controllo dei permessi
        if (requestingUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Accesso negato. Solo gli admin possono creare altri admin.' });
        }

        // Ricerca dell'utente per email
        let existingUser = await User.findOne({ email });

        if (existingUser && existingUser.role === 'admin') {
            return res.status(400).json({ msg: 'Utente già registrato come admin.' });
        } else if (existingUser && existingUser.role === 'user') {
            existingUser.role = 'admin';
            await existingUser.save();
            res.json({ msg: `Ruolo dell'utente ${existingUser.email} aggiornato a admin.` });

            // Invio della notifica Telegram
            const message = `👑 *Amministratore Creato*\n\n**Nome:** ${existingUser.name}\n**Email:** ${existingUser.email}\n**Creato da:** ${requestingUser.name}\n**Data:** ${new Date().toLocaleString('it-IT')}`;
            sendMessage(message);
        } else {
            // Creazione di un nuovo admin
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newAdmin = new User({
                name,
                email,
                password: hashedPassword,
                role: 'admin'
            });

            await newAdmin.save();
            res.json({ msg: 'Amministratore creato con successo.' });

            // Invio della notifica Telegram
            const message = `👑 *Amministratore Creato*\n\n**Nome:** ${name}\n**Email:** ${email}\n**Creato da:** ${requestingUser.name}\n**Data:** ${new Date().toLocaleString('it-IT')}`;
            sendMessage(message);
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Errore del server');
    }
};

/**
 * Ottiene tutti gli utenti (solo per admin).
 */
exports.getAllUsers = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log(user);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'Accesso negato. Solo gli amministratori possono visualizzare gli utenti.' });
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Errore del server.' });
    }
};

/**
 * Elimina un utente (solo per admin).
 * Invia una notifica al bot Telegram dopo la rimozione.
 */
exports.deleteUser = async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id).select('-password');
        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Accesso negato. Solo gli amministratori possono eliminare utenti.' });
        }

        const email = req.params.id;
        console.log(`Richiesta di eliminazione utente: ${email}`);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'Utente non trovato.' });
        }

        await User.deleteOne({ email });

        // Invio della notifica Telegram
        const removalMessage = `🗑️ *Utente Eliminato*\n\n**Nome:** ${user.name}\n**Email:** ${user.email}\n**Eliminato da:** ${requestingUser.name}\n**Data:** ${new Date().toLocaleString('it-IT')}`;
        sendMessage(removalMessage);

        res.json({ msg: `Utente ${email} eliminato con successo.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Errore del server.' });
    }
};

/**
 * Ottiene le statistiche di registrazione degli utenti (solo per admin).
 */
exports.getUserRegistrationStats = async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id).select('-password');
        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Accesso negato. Solo gli amministratori possono visualizzare le statistiche.' });
        }

        const stats = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Errore del server.' });
    }
};

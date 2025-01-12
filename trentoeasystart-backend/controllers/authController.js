const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMessage } = require('../services/telegramService');


exports.register = async (req, res) => {
    const { name, email, password, role} = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Per favore, inserisci tutti i campi.' });
    }

    if (role && role !== 'user' && role !== 'admin') {
        return res.status(400).json({ msg: 'Ruolo non valido.' });
    }

    if (role === 'admin' && req.user && await User.findById(req.user.id).select('-password').role !== 'admin') {
        return res.status(400).json({ msg: 'Non hai i permessi per registrare un amministratore.' });
    }

    try {

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Utente già registrato.' });
        }


        user = new User({
            role: role || 'user',
            name,
            email,
            password
        });


        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);


        await user.save();


        const payload = {
            user: {
                id: user.id,
                name: user.name
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });


                const message = `📢 Nuovo Utente Registrato:\n\nNome: ${name}\nEmail: ${email}\nData: ${new Date().toLocaleString('it-IT')}`;
                sendMessage(message);
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.login = async (req, res) => {
    const { email, password} = req.body;


    if (!email || !password) {
        return res.status(400).json({ msg: 'Per favore, inserisci tutti i campi.' });
    }

    try {

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenziali non valide.' });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenziali non valide.' });
        }

        const payload = {
            user: {
                id: user.id,
                name: user.name
            }
        };

        console.log('User data:', user);

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ "token": token, "role": user.role});


                const message = `🔑 Utente Effettua il Login:\n\nEmail: ${email}\nData: ${new Date().toLocaleString('it-IT')}`;
                sendMessage(message);
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        console.log(name, email, password)
        return res.status(400).json({msd: 'Errore nei campi inseriti'});
    }

    const user = await User.findById(req.user.id).select('-password');

    if (user.role !== 'admin') {
        return res.status(403).json({ msg: 'Accesso negato. Solo gli admin possono creare altri admin.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user && user.role == 'admin') {
            return res.status(400).json({ msg: 'Utente già registrato come admin.' });
        }

        else if(user && user.role == 'user'){
            user.role = 'admin';
            await user.save()
            res.json({ msg: 'Ruolo Utente Aggiornato.' });
        }

        else {
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
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Errore del server');
    }
};


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


exports.deleteUser = async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id).select('-password');
        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Accesso negato. Solo gli amministratori possono eliminare utenti.' });
        }

        const email = req.params.id;
        console.log(email)
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({ msg: 'Utente non trovato.' });
        }

        await User.deleteOne({email});
        res.json({ msg: `Utente ${email} eliminato con successo.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Errore del server.' });
    }
};


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


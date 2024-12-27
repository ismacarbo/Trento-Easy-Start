const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMessage } = require('../services/telegramService');


exports.register = async (req, res) => {
    const { name, email, password } = req.body;


    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Per favore, inserisci tutti i campi.' });
    }

    try {

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Utente già registrato.' });
        }


        user = new User({
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
    const { email, password } = req.body;


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
                res.json({ token });


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

const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

exports.sendContact = async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        const newContact = new Contact({
            name,
            email,
            subject,
            message,
        });

        await newContact.save();


        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `Nuovo Messaggio: ${subject}`,
            text: `Hai ricevuto un nuovo messaggio da ${name} (${email}):\n\n${message}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Errore nell\'invio dell\'email');
            } else {
                console.log('Email inviata: ' + info.response);
                res.json({ msg: 'Messaggio inviato con successo' });
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ dateSent: -1 });
        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

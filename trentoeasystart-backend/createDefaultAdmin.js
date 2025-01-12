const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createDefaultAdmin = async () => {
    const defaultAdmin = {
        name: 'Admin Default',
        email: 'admin@trentoeasystart.it',
        password: 'trentoEzStartADmin00?',
        role: 'admin'
    };

    try {

        // Controlla se esiste almeno un admin
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin già esistente. Nessuna azione necessaria.');
            return;
        }

        // Crea l'admin di default
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, salt);

        const admin = new User({
            name: defaultAdmin.name,
            email: defaultAdmin.email,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin di default creato con successo.');
    } catch (error) {
        console.error('Errore durante la creazione dell\'admin di default:', error);
    } 
};

module.exports = createDefaultAdmin;

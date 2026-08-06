require('dotenv').config();
const { empresaModels } = require('./models');

async function test() {
    try {
        const empresas = await empresaModels.findAll({ raw: true });
        console.log("Found empresas:", empresas.length);
        const tuempresa = empresas.find(e => e.emp_nombre.toLowerCase().includes('tuempresa'));
        console.log("Tuempresa row:", tuempresa);
    } catch (err) {
        console.error("Error checking empresas:", err);
    }
}

test();

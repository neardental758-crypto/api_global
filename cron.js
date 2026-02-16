const cron = require('node-cron');
const { reagendarCitas } = require('./services/reagendarCitas');

// Configurar el cron job para ejecutarse todos los domingos a las 00:00
cron.schedule('0 0 * * 0', async () => {
  console.log('Iniciando el proceso de reagendado de citas...');
  await reagendarCitas();
});

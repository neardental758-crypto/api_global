const Estacion = require('./models/mysql/estacion');
const { sequelize } = require('./config/mysql');

async function test() {
    try {
        const estaciones = await Estacion.findAll({ limit: 5 });
        console.log("ESTACIONES DB:");
        console.log(JSON.stringify(estaciones, null, 2));
    } catch (e) {
        console.error("ERROR DB:", e);
    } finally {
        await sequelize.close();
    }
}
test();

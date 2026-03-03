import { sequelize } from './config/mysql.js';
import Estacion from './models/mysql/estacion.js';

async function test() {
    try {
        const estaciones = await Estacion.findAll({ limit: 5 });
        console.log(JSON.stringify(estaciones, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
test();

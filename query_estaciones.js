const { sequelize } = require('./config/mysql');
const { QueryTypes } = require('sequelize');

async function run() {
  try {
    const estaciones = await sequelize.query("SELECT est_estacion FROM bc_estaciones LIMIT 10", { type: QueryTypes.SELECT });
    console.log("Estaciones:", estaciones);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();

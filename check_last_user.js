const { sequelize } = require('./config/mysql');
const { QueryTypes } = require('sequelize');

async function run() {
  try {
    const rows = await sequelize.query(
      "SELECT usu_documento, usu_nombre, usu_email, usu_img, usu_created_at FROM bc_usuarios ORDER BY usu_created_at DESC LIMIT 1",
      { type: QueryTypes.SELECT }
    );
    console.log("LAST USER:", rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();

require('dotenv').config();
const { sequelize } = require("./config/mysql");
sequelize.query("SELECT usu_documento, usu_nombre, usu_email, usu_habilitado FROM bc_usuarios WHERE usu_habilitado IN (-1, 0) LIMIT 10").then(res => { console.log(res[0]); process.exit(0); }).catch(console.error);

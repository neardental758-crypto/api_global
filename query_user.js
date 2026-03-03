require('dotenv').config();
const { sequelize } = require("./config/mysql");
sequelize.query("SELECT usu_documento, usu_created_at FROM bc_usuarios WHERE usu_documento = '45657653480078'").then(res => { console.log(res[0]); process.exit(0); }).catch(console.error);

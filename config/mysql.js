const { Sequelize } = require('sequelize');

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;

const sequelize = new Sequelize(
    database,
    username,
    password,
    {
        host,
        dialect: 'mysql',
        define: {
            timestamps: false, //la marca de tiempo en false para que no la tome en ningún modelo (createdAt, updatedAt)
            freezeTableName: true, //congela el nombre de la tabla y no le agrega el plural
        }
    }
)

const dbConnectMysql = async () =>{
    try {
        await sequelize.authenticate();
        console.log('Mysql conexión correcta');
    } catch (error) {
        console.log('Mysql error de conexion', error);
    }
}

module.exports = { sequelize, dbConnectMysql }

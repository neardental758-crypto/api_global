const { Sequelize } = require('sequelize');

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;

const port = process.env.MYSQL_PORT || 3306;

const sequelize = new Sequelize(
    database,
    username,
    password,
    {
        host,
        port,
        dialect: 'mysql',
        define: {
            timestamps: false, //la marca de tiempo en false para que no la tome en ningún modelo (createdAt, updatedAt)
            freezeTableName: true, //congela el nombre de la tabla y no le agrega el plural
        },
        pool: {
            max: 3,             // Reduce max active connections to prevent resource usage spikes
            min: 0,             // Do not keep connections open when idle
            acquire: 30000,     // Timeout in ms to acquire connection
            idle: 5000          // Close connection if idle for 5 seconds to reduce count
        }
    }
)

const dbConnectMysql = async () => {
    try {
        await sequelize.authenticate();
        console.log('Mysql conexión correcta');
    } catch (error) {
        console.log('Mysql error de conexion', error);
    }
}

module.exports = { sequelize, dbConnectMysql }

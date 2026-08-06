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
        logging: false, // Desactiva los logs masivos de "Executing (default): SELECT..." en Hostinger
        define: {
            timestamps: false, //la marca de tiempo en false para que no la tome en ningún modelo (createdAt, updatedAt)
            freezeTableName: true, //congela el nombre de la tabla y no le agrega el plural
        },
        dialectOptions: {
            connectTimeout: 60000,
            keepAliveInitialDelay: 10000,
            enableKeepAlive: true
        },
        pool: {
            max: 5,             // Máximo de conexiones activas
            min: 1,             // Mantener al menos 1 conexión abierta para no crear nuevas constantemente
            acquire: 60000,     // Tiempo de espera para adquirir conexión
            idle: 300000        // Mantener la conexión inactiva 5 minutos antes de cerrarla (evita agotar max_connections_per_hour)
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

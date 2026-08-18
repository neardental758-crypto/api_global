const { Sequelize } = require('sequelize');

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST || 'localhost';

const port = process.env.MYSQL_PORT || 3306;

const sequelize = new Sequelize(
    database,
    username,
    password,
    {
        host,
        port,
        dialect: 'mysql',
        logging: false, // Desactiva los logs masivos en consola
        define: {
            timestamps: false, // la marca de tiempo en false para que no la tome en ningún modelo (createdAt, updatedAt)
            freezeTableName: true, // congela el nombre de la tabla y no le agrega el plural
        },
        dialectOptions: {
            connectTimeout: 30000
        },
        pool: {
            max: 5,             // Máximo de conexiones simultáneas en el pool
            min: 0,             // 0 para no forzar conexiones abiertas permanentes cuando no hay uso
            acquire: 30000,     // Tiempo máximo de espera para obtener una conexión (30s)
            idle: 10000,        // Cierra conexiones inactivas después de 10s para evitar que MySQL las mate por wait_timeout
            evict: 10000        // Intervalo de limpieza de conexiones inactivas
        }
    }
);

const dbConnectMysql = async () => {
    try {
        await sequelize.authenticate();
        console.log('Mysql conexión correcta');
    } catch (error) {
        console.log('Mysql error de conexion', error);
    }
}

module.exports = { sequelize, dbConnectMysql }

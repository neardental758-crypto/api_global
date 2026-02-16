const { sequelize2 } = require('../../config/mysql');
const { QueryTypes } = require('sequelize');

//Usuarios
//Limite desde donde - cuantos
const getUsers = async (req, res) => {
    const empresa = req.query.organizationId;
    const query = "SELECT * FROM `usuario` INNER JOIN `Empresa` ON `usuario`.Empresa = `Empresa`.Empresa WHERE IdOrganization='"+`${empresa}`+"' ORDER BY FechaRegistro DESC";
    sequelize2.query(query, { type: QueryTypes.SELECT })
    .then(result => {
        if (!result) {
            res.status(404).send({ message: "Data not found." });
        }
        res.status(200).send(result);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};
//Recorridos por mes
const getLoan = async (req, res) => {
    const limit = 500;
    const empresa = req.query.organizationId;
    const query = "SELECT * FROM `BC_TABLA_PRESTAMO_0Q7OQ` INNER JOIN `usuario` ON `BC_TABLA_PRESTAMO_0Q7OQ`.PRESTAMO_USUARIO = `usuario`.Cedula INNER JOIN `Empresa` ON `usuario`.Empresa = `Empresa`.Empresa WHERE IdOrganization='"+`${empresa}`+"' ORDER BY PRESTAMO_HORASERVER DESC LIMIT " + `${limit}`;
    sequelize2.query(query, { type: QueryTypes.SELECT })
    .then(result => {
        if (!result) {
            res.status(404).send({ message: "Data not found." });
        }
        res.status(200).send(result);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

const getUsersFilterToDate = async (req, res) => {
    const filtro = req.body;
    const empresa = filtro.organizationId;
    const startDate = filtro.startDate;
    const endDate = filtro.endDate;
    const query = "SELECT * FROM `usuario` INNER JOIN `Empresa` ON `usuario`.Empresa = `Empresa`.Empresa WHERE IdOrganization='"+`${empresa}`+"' AND FechaRegistro BETWEEN '"+`${startDate}`+"' AND '"+ `${endDate}`+"' ORDER BY FechaRegistro DESC";
    sequelize2.query(query, { type: QueryTypes.SELECT })
    .then(result => {
        if (!result) {
            res.status(404).send({ message: "Data not found." });
        }
        res.status(200).send(result);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

const getLoanFilterToDate = async (req, res) => {
        const filtro = req.body;
        const empresa = filtro.organizationId;
        const startDate = filtro.startDate;
        const endDate = filtro.endDate;
        const query = "SELECT * FROM `BC_TABLA_PRESTAMO_0Q7OQ` INNER JOIN `usuario` ON `BC_TABLA_PRESTAMO_0Q7OQ`.PRESTAMO_USUARIO = `usuario`.Cedula INNER JOIN `Empresa` ON `usuario`.Empresa = `Empresa`.Empresa WHERE IdOrganization='"+`${empresa}`+"' AND `BC_TABLA_PRESTAMO_0Q7OQ`.PRESTAMO_HORASERVER BETWEEN '"+`${startDate}`+"' AND '"+ `${endDate}`+"'";
        sequelize2.query(query, { type: QueryTypes.SELECT })
        .then(result => {
            if (!result) {
                res.status(404).send({ message: "Data not found." });
            }
            res.status(200).send(result);
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};
//Estaciones utilizadas por mes - BC_TABLA_PRESTAMO_0Q7OQ.PRESTAMO_RETIRO_ESTACION ( fechas )
const getStations = async (req, res) => {
    const empresa = req.query.organizationId;
    const query = "SELECT PRESTAMO_RETIRO_ESTACION,PRESTAMO_HORASERVER,PRESTAMO_USUARIO FROM `BC_TABLA_PRESTAMO_0Q7OQ` INNER JOIN `usuario` ON `BC_TABLA_PRESTAMO_0Q7OQ`.PRESTAMO_USUARIO = `usuario`.Cedula INNER JOIN `Empresa` ON `usuario`.Empresa = `Empresa`.Empresa WHERE IdOrganization='"+`${empresa}`+"' ORDER BY PRESTAMO_HORASERVER DESC";
    sequelize2.query(query, { type: QueryTypes.SELECT })
    .then(result => {
        if (!result) {
            res.status(404).send({ message: "Data not found." });
        }
        res.status(200).send(result);
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};


module.exports = { getUsers, getLoan, getStations, getLoanFilterToDate, getUsersFilterToDate }

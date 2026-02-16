const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Formulario = sequelize.define(
    "formtuimpacto",
    {
        form_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING,
        },
        apellido: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        distanciaTotal: {
            type: DataTypes.STRING,
        },
        registro: {
            type: DataTypes.DATE,
        },
        edad: {
            type: DataTypes.STRING,
        },
        genero: {
            type: DataTypes.STRING,
        },
        textGenero: {
            type: DataTypes.STRING,
        },
        transportePrimario: {
            type: DataTypes.JSON,
        },
        tiempoCasaTrabajo: {
            type: DataTypes.STRING,
        },
        tiempoTrabajoCasa: {
            type: DataTypes.STRING,
        },
        diasDesplazamientoAlTrabajo: {
            type: DataTypes.STRING,
        },
        horarioHabitualDesde: {
            type: DataTypes.TIME,
        },
        horarioHabitualHasta: {
            type: DataTypes.TIME,
        },
        showGastoPromedioTransporteSemana: {
                type: DataTypes.STRING,
            },
        satisfaccionTransporte: {
            type: DataTypes.STRING,
        },
        factor: {
                type: DataTypes.STRING,
        },
        cualFactor: {
            type: DataTypes.STRING,
        },
        viable: {
            type: DataTypes.STRING,
        },
        alternativa: {
            type: DataTypes.STRING,
        },
        cualAlternativa: {
            type: DataTypes.STRING,
        },
        ejercicio: {
            type: DataTypes.STRING,
        },
        gustoPorPrograma: {
            type: DataTypes.STRING,
        },
        biciElectricaCompartida: {
            type: DataTypes.STRING,
        },
        motivo: {
            type: DataTypes.STRING,
        },
        cualMotivo: {
            type: DataTypes.STRING,
        },
        beneficio: {
            type: DataTypes.STRING,
        },
        cualBeneficio: {
            type: DataTypes.STRING,
        },
        conocePrograma: {
            type: DataTypes.STRING,
        },
        disposicion: {
            type: DataTypes.STRING,
        },
        descripcion: {
            type: DataTypes.STRING,
        },
        cualDescripcion: {
            type: DataTypes.STRING,
        },
        textBeneficio: {
            type: DataTypes.STRING,
        },
        textSostenible: {
            type: DataTypes.STRING,
        },
        coDos: {
            type: DataTypes.STRING,
        },
        costoTransporte: {
            type: DataTypes.STRING,
        },
        tiempoPerdido: {
            type: DataTypes.STRING,
        },
        calorias: {
            type: DataTypes.STRING,
        },
        arboles: {
            type: DataTypes.STRING,
        },
        ahorro: {
            type: DataTypes.STRING,
        },
        diasBeneficio: {
            type: DataTypes.STRING,
        },
        caloriasBeneficio: {
            type: DataTypes.STRING,
        },
        residencia: {
            type: DataTypes.JSON,
        },
        trabajo: {
            type: DataTypes.JSON,
        },
        totalTiempoViaje: {
            type: DataTypes.STRING,
        },
    }
);

module.exports = Formulario;

const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const Empresa = sequelize.define(
    "bc_empresas",
    {
        emp_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
    	emp_nombre: {
            type: DataTypes.STRING,
        },
        emp_email: {
            type: DataTypes.TEXT,
        },
        emp_estado: {
            type: DataTypes.STRING,
        },
        emp_costo: {
            type: DataTypes.INTEGER,
        },
        _perfil: {
            type: DataTypes.STRING
        },
        _recompensas: {
            type: DataTypes.STRING
        },
        _3G: {
            type: DataTypes.STRING
        },
        _4G: {
            type: DataTypes.STRING
        },
        _5G: {
            type: DataTypes.STRING
        },
        _electrohub: {
            type: DataTypes.STRING
        },
        _parquadero: {
            type: DataTypes.STRING
        },
        _carro_compartido: {
            type: DataTypes.STRING
        }, 
        _ruta_corporativa: {
            type: DataTypes.STRING
        }, 
        _vehiculo_particular: {
            type: DataTypes.STRING
        },
        emp_carro_compartido: {
            type: DataTypes.BOOLEAN
        },
        emp_moto_compartido: {
            type: DataTypes.BOOLEAN
        },
        aplicacion: {
            type: DataTypes.STRING,
        },
        emp_logo: {
            type: DataTypes.TEXT,
        },
        emp_created_at: {
            type: DataTypes.DATE,
        },
        emp_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = Empresa;

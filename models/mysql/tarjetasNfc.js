const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const TarjetaNfc = sequelize.define(
    "bc_tarjetas_nfc",
    {
        tnfc_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        tnfc_numero_tarjeta: {
            type: DataTypes.INTEGER,
        },
        tnfc_id_hexadecimal: {
            type: DataTypes.STRING(50),
        },
        tnfc_estado: {
            type: DataTypes.STRING(50),
            defaultValue: 'Active'
        },
        tnfc_usuario_id: {
            type: DataTypes.STRING,
        },
        tnfc_created_at: {
            type: DataTypes.DATE,
        },
        tnfc_updated_at: {
            type: DataTypes.DATE,
        }
    },
    {
        timestamps: false
    }
);

module.exports = TarjetaNfc;

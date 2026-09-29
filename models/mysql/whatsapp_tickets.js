const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const WhatsAppTicket = sequelize.define(
    "tickets",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ticket_number: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true,
        },
        wa_id: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(64),
            defaultValue: 'GENERAL',
        },
        subcategory: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        context_data: {
            type: DataTypes.TEXT,
            defaultValue: '{}',
        },
        priority: {
            type: DataTypes.STRING(16),
            defaultValue: 'MEDIA',
        },
        status: {
            type: DataTypes.STRING(16),
            defaultValue: 'OPEN',
        },
        assigned_agent: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'tickets',
        freezeTableName: true,
    }
);

module.exports = WhatsAppTicket;

const { sequelize } = require('../../config/mysql');
const { DataTypes } = require('sequelize');

const WhatsAppChatMessage = sequelize.define(
    "whatsapp_chat_messages",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        wa_id: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        ticket_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        sender_type: {
            type: DataTypes.STRING(16),
            allowNull: false, // 'USER', 'BOT', 'AGENT'
        },
        sender_name: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },
        message_text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        media_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
        tableName: 'whatsapp_chat_messages',
        freezeTableName: true,
    }
);

module.exports = WhatsAppChatMessage;

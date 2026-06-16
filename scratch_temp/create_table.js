require('dotenv').config();
const { sequelize } = require('../config/mysql');

async function createTable() {
  try {
    console.log("Conectando a la base de datos y creando tabla...");
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`bc_reportes_contradicciones\` (
        \`rep_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`rep_estacion\` VARCHAR(255) NOT NULL,
        \`rep_bicicleta_id\` INT NULL,
        \`rep_bicicleta_numero\` VARCHAR(255) NULL,
        \`rep_tecnico_documento\` VARCHAR(255) NOT NULL,
        \`rep_comentario\` TEXT NOT NULL,
        \`rep_estado\` VARCHAR(255) DEFAULT 'PENDIENTE',
        \`rep_fecha_creacion\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("¡Tabla \`bc_reportes_contradicciones\` creada o ya existente de manera exitosa!");
  } catch (error) {
    console.error("Error al crear la tabla:", error);
  } finally {
    process.exit();
  }
}

createTable();

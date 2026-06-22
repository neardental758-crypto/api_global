require('dotenv').config();
const { sequelize } = require('./config/mysql');

async function runMigration() {
    try {
        console.log('Starting DB migration for Swapping module...');

        // 1. Add can_bateria_vehiculo to bc_candados if not exists
        try {
            // Check if column exists
            const [results] = await sequelize.query("SHOW COLUMNS FROM `bc_candados` LIKE 'can_bateria_vehiculo'");
            if (results.length === 0) {
                console.log('Adding column can_bateria_vehiculo to bc_candados...');
                await sequelize.query("ALTER TABLE `bc_candados` ADD COLUMN `can_bateria_vehiculo` INT DEFAULT 0 AFTER `can_bateria`;");
            } else {
                console.log('Column can_bateria_vehiculo already exists in bc_candados.');
            }
        } catch (colErr) {
            // Fallback alter query
            try {
                await sequelize.query("ALTER TABLE `bc_candados` ADD COLUMN `can_bateria_vehiculo` INT DEFAULT 0 AFTER `can_bateria`;");
                console.log('Column can_bateria_vehiculo added successfully.');
            } catch (innerErr) {
                console.log('Column can_bateria_vehiculo might already exist:', innerErr.message);
            }
        }

        // 2. Create bc_cambios_baterias table with matching charsets/collations
        console.log('Creating bc_cambios_baterias table if not exists...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS \`bc_cambios_baterias\` (
              \`cba_id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`cba_operario_id\` VARCHAR(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
              \`cba_vehiculo_id\` INT NOT NULL,
              \`cba_candado_id\` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
              \`cba_fecha\` DATETIME NOT NULL,
              \`cba_estado\` VARCHAR(50) DEFAULT 'PENDIENTE',
              \`cba_created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
              \`cba_updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX \`idx_cba_operario\` (\`cba_operario_id\`),
              INDEX \`idx_cba_vehiculo\` (\`cba_vehiculo_id\`),
              INDEX \`idx_cba_candado\` (\`cba_candado_id\`),
              CONSTRAINT \`fk_cba_operario\` FOREIGN KEY (\`cba_operario_id\`) REFERENCES \`bc_usuarios\` (\`usu_documento\`) ON DELETE RESTRICT ON UPDATE CASCADE,
              CONSTRAINT \`fk_cba_vehiculo\` FOREIGN KEY (\`cba_vehiculo_id\`) REFERENCES \`bc_bicicletas\` (\`bic_id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
              CONSTRAINT \`fk_cba_candado\` FOREIGN KEY (\`cba_candado_id\`) REFERENCES \`bc_candados\` (\`can_id\`) ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('Table bc_cambios_baterias created successfully.');
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();

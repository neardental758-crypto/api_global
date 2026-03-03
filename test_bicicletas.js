const { bicicletasModels, bicicleterosModels } = require('./models');
const { sequelize } = require('./config/mysql');

async function test() {
    try {
        const data = await bicicletasModels.findAll({
            where: { bic_estacion: 'Estacion tuempresa' },
            include: {
                model: bicicleterosModels,
            },
        });
        console.log("SUCCESS:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("ERROR DB:", e);
    } finally {
        await sequelize.close();
    }
}
test();

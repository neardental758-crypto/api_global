require('dotenv').config();
const { bicicleterosModels, bicicletasModels } = require('../models');

async function listStations() {
  try {
    console.log("Consultando estaciones en bc_bicicleteros...");
    const stations = await bicicleterosModels.findAll({
      attributes: ['bro_estacion'],
      group: ['bro_estacion']
    });
    console.log("Estaciones encontradas:", stations.map(s => s.bro_estacion));

    if (stations.length > 0) {
      const activeStation = stations[0].bro_estacion;
      console.log(`\nConsultando items de la estación: "${activeStation}"...`);
      const data = await bicicleterosModels.findAll({
        where: { bro_estacion: activeStation },
        include: [{
          model: bicicletasModels,
          required: false
        }]
      });
      console.log("Consulta exitosa! Cantidad de items:", data.length);
      if (data.length > 0) {
        console.log("Primer item:", JSON.stringify(data[0], null, 2));
      }
    }
  } catch (error) {
    console.error("Error al consultar:", error);
  } finally {
    process.exit();
  }
}

listStations();

require('dotenv').config();
const { estacionModels } = require('./models');

async function test() {
  try {
    const est = await estacionModels.findOne({
      where: { est_direccion: 'dir trabajo' }
    });
    console.log("=== MATCHING STATION ===");
    console.log(est ? est.toJSON() : "Not found");
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

test();

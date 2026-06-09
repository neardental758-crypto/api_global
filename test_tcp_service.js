const assert = require('assert');
const net = require('net');

// Set mock port
process.env.LOCK_TCP_PORT = 9999;
process.env.MOTORDB = 'mysql';

// 1. Mock DB Models in require cache before importing lockTcpService
const models = require('./models');

const calls = [];
let mockPrestamoRuta = null;

models.candadosModels = {
  findOne: async (options) => {
    calls.push({ method: 'candadosModels.findOne', options });
    return {
      can_id: 'can_123456789012345',
      can_imei: '123456789012345',
      can_bicicleta: 42
    };
  },
  create: async (data) => {
    calls.push({ method: 'candadosModels.create', data });
    return data;
  },
  update: async (data, options) => {
    calls.push({ method: 'candadosModels.update', data, options });
    return [1];
  }
};

models.prestamosModels = {
  findOne: async (options) => {
    calls.push({ method: 'prestamosModels.findOne', options });
    return {
      pre_id: 101,
      pre_bicicleta: 42,
      pre_estado: 'ACTIVA',
      pre_modulo: '5g'
    };
  }
};

models.prestamosRutaModels = {
  findOne: async (options) => {
    calls.push({ method: 'prestamosRutaModels.findOne', options });
    return mockPrestamoRuta;
  },
  create: async (data) => {
    calls.push({ method: 'prestamosRutaModels.create', data });
    mockPrestamoRuta = {
      pr_id: 501,
      pr_prestamo_id: data.pr_prestamo_id,
      pr_ruta: data.pr_ruta
    };
    return mockPrestamoRuta;
  },
  update: async (data, options) => {
    calls.push({ method: 'prestamosRutaModels.update', data, options });
    if (mockPrestamoRuta) {
      mockPrestamoRuta.pr_ruta = data.pr_ruta;
    }
    return [1];
  }
};

// Import TCP lock service
const lockTcpService = require('./services/lockTcpService');

async function runTest() {
  console.log('🚀 Starting TCP Lock Service Test...');

  // Start the server
  const server = lockTcpService.startLockTcpServer();

  // Connect client to server
  const client = net.createConnection({ port: 9999 }, () => {
    console.log('✅ Client connected to lock TCP server.');

    // Send first D0 position command
    // format: *CMDR,OM,<IMEI>,<time>,D0,<type>,<utcTime>,<status>,<lat>,<NS>,<lon>,<EW>#
    // Lat: 0440.03733, N -> 4.66728883
    // Lon: 07403.96001, W -> -74.06600017
    const payload = '*CMDR,OM,123456789012345,260609092100,D0,1,092100,A,0440.03733,N,07403.96001,W#\n';
    client.write(payload);
    console.log('📤 Sent D0 payload to server.');
  });

  client.on('error', (err) => {
    console.error('❌ Client connection error:', err);
    process.exit(1);
  });

  // Wait for processing
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    // Assert calls were made to mock DB models
    console.log('\n--- VERIFYING FIRST COORD INSERTION ---');
    console.log('Total calls registered:', calls.length);
    calls.forEach((c, i) => console.log(`  Call #${i + 1}: ${c.method}`));

    // FindOne checks for the lock
    const candadoFind = calls.find(c => c.method === 'candadosModels.findOne');
    assert.ok(candadoFind, 'Should query candadosModels.findOne');
    assert.deepStrictEqual(candadoFind.options.where, { can_imei: '123456789012345' });

    // FindOne checks for the active prestamo
    const prestamoFind = calls.find(c => c.method === 'prestamosModels.findOne');
    assert.ok(prestamoFind, 'Should query prestamosModels.findOne');
    assert.strictEqual(prestamoFind.options.where.pre_bicicleta, 42);
    assert.strictEqual(prestamoFind.options.where.pre_estado, 'ACTIVA');
    assert.strictEqual(prestamoFind.options.where.pre_modulo, '5g');

    // Should query if route exists
    const rutaFind = calls.find(c => c.method === 'prestamosRutaModels.findOne');
    assert.ok(rutaFind, 'Should query prestamosRutaModels.findOne');
    assert.strictEqual(rutaFind.options.where.pr_prestamo_id, 101);

    // Should create new route since mockPrestamoRuta was null
    const rutaCreate = calls.find(c => c.method === 'prestamosRutaModels.create');
    assert.ok(rutaCreate, 'Should call prestamosRutaModels.create');
    assert.strictEqual(rutaCreate.data.pr_prestamo_id, 101);
    
    const parsedRoute = JSON.parse(rutaCreate.data.pr_ruta);
    assert.strictEqual(parsedRoute.length, 1);
    assert.strictEqual(parsedRoute[0].latitude, 4.66728883);
    assert.strictEqual(parsedRoute[0].longitude, -74.06600017);
    console.log('✅ First coordinate inserted correctly: 4.66728883, -74.06600017');

    // Now send a second coordinate (different position) to test path appending
    console.log('\n📤 Sending second coordinate (different position)...');
    calls.length = 0; // reset calls tracking
    // Lat: 0440.04000, N -> 4.66733333
    // Lon: 07403.97000, W -> -74.06616667
    const payload2 = '*CMDR,OM,123456789012345,260609092200,D0,1,092200,A,0440.04000,N,07403.97000,W#\n';
    client.write(payload2);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Total calls registered in second round:', calls.length);
    calls.forEach((c, i) => console.log(`  Call #${i + 1}: ${c.method}`));

    // Should query route
    const rutaFind2 = calls.find(c => c.method === 'prestamosRutaModels.findOne');
    assert.ok(rutaFind2, 'Should query prestamosRutaModels.findOne');

    // Should update existing route
    const rutaUpdate = calls.find(c => c.method === 'prestamosRutaModels.update');
    assert.ok(rutaUpdate, 'Should call prestamosRutaModels.update');
    
    const parsedRouteUpdated = JSON.parse(mockPrestamoRuta.pr_ruta);
    assert.strictEqual(parsedRouteUpdated.length, 2);
    assert.strictEqual(parsedRouteUpdated[0].latitude, 4.66728883);
    assert.strictEqual(parsedRouteUpdated[1].latitude, 4.66733333);
    console.log('✅ Second coordinate appended correctly! Total coordinates in route:', parsedRouteUpdated.length);

    // Now send a third coordinate (identical to the second) to test consecutive duplicate filtering
    console.log('\n📤 Sending third coordinate (duplicate position)...');
    calls.length = 0; // reset calls tracking
    client.write(payload2);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Total calls registered in third round:', calls.length);
    // Should NOT call prestamosRutaModels.update because coordinates are identical
    const duplicateUpdate = calls.find(c => c.method === 'prestamosRutaModels.update');
    assert.strictEqual(duplicateUpdate, undefined, 'Should not update route for consecutive duplicate coordinates');
    console.log('✅ Duplicate coordinate successfully filtered and ignored!');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
    client.destroy();
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Test failed:', err);
    client.destroy();
    server.close(() => {
      process.exit(1);
    });
  }
}

runTest();

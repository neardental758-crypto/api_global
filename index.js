// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
//SQL connection
require("dotenv").config()
const express = require('express');
const cors = require('cors');
const { dbConnectMysql } = require('./config/mysql');
const app = express();
const cron = require('./cron');
const { startSessionCleanup, startAgendamientosCleanup, startReservationsCleanup } = require('./utils/cronJobs');
const path = require('path');
const { startLockTcpServer } = require('./services/lockTcpService');

app.use(cors());
app.use(express.json())
app.use(express.static("storage"))
// Expose the static resized images folder for React Native
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const port = process.env.API_PORT || process.env.PORT || 3002;
cron;
startSessionCleanup();
startAgendamientosCleanup();
startReservationsCleanup();

//RUTAS
app.use("/api", require("./routes/"));

app.listen(port, () => {
    console.log(`🚀 API lista por el puerto: ${port}`);
});

dbConnectMysql();
startLockTcpServer();
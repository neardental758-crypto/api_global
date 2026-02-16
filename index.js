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
const { startSessionCleanup, startAgendamientosCleanup } = require('./utils/cronJobs');

app.use(cors());
app.use(express.json())
app.use(express.static("storage"))

const portsql = 3002;
cron;
startSessionCleanup();
startAgendamientosCleanup();

//RUTAS
//usamos la peticion del cliente y requerimos el index de cada ruta
app.use("/api", require("./routes/"));

app.listen(portsql, ()=>{
    console.log('Mysql por el puerto : '+ portsql);
});

dbConnectMysql() ;
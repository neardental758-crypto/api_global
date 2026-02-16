const express = require('express');
const router = express.Router();
const { getItem } = require('../controllers/versiones');

router.get("/nombre_app/:nombre_app", getItem);

module.exports = router;
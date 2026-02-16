const express = require('express');
const router = express.Router();
const { getItems, createItem, getItem } = require('../controllers/teorica');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:_id", authMiddleware(["all"]), getItem);

router.post("/registrar", authMiddleware(["all"]), createItem);

module.exports = router;
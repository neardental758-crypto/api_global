const express = require('express');
const router = express.Router();
const { getItems, getItem } = require('../controllers/tipoPenalizacion');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);
router.get("/id/:id", authMiddleware(["all"]), getItem);

module.exports = router;

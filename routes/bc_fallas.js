const express = require('express');
const router = express.Router();
const { validatorCreateFallas, validatorGetFallas } = require('../validators/fallasValidators');
const { getItems, getItem, createItem, updateItem, deleteItem} = require('../controllers/fallas');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/id/:fal_id", authMiddleware(["all"]), validatorGetFallas, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreateFallas, createItem);

module.exports = router;
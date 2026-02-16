const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet } = require('../validators/parqueo_feedback_validators');
const { getItems, getItem, createItem, updateItem, deleteItem, getItemsToDate} = require('../controllers/parqueo_feedback');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/commentsFilter", authMiddleware(["all"]), getItemsToDate);

router.get("/id/:com_id", authMiddleware(["all"]), validatorGet, getItem);

router.post("/registrar", authMiddleware(["all"]), validatorCreate, createItem);

module.exports = router;

const express = require('express');
const router = express.Router();
const { validatorCreateForm, validatorGetForm } = require('../validators/formtuimpactoValidators');
const { getItems, getItem, createItem, updateItem, deleteItem, getItemsToDate } = require('../controllers/formtuimpacto');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);
router.get("/formFilter", authMiddleware(["all"]), getItemsToDate);

router.get("/id/:form_id", authMiddleware(["all"]), validatorGetForm, getItem);

router.post("/registrar", authMiddleware(["all"]),validatorCreateForm, createItem);

router.put("/", authMiddleware(["all"]), updateItem);

router.delete("/:_id", authMiddleware(["all"]), deleteItem);

module.exports = router;

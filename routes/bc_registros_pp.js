const express = require('express');
const router = express.Router();
const { validatorCreate, validatorGet } = require('../validators/registroppValidators');
const { getItems, getItem, createItem,  updateItem, getItemsByOrganization} = require('../controllers/registrospp');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), validatorGet, getItems);

router.get("/:id", authMiddleware(["all"]), validatorGet, getItem);

router.patch("/:id", authMiddleware(["all"]), validatorGet ,updateItem);

router.post("/registrar", validatorCreate, createItem);

router.get("/empresa/:organizationId", authMiddleware(["all"]), getItemsByOrganization);

module.exports = router;
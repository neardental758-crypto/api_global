const express = require('express');
const router = express.Router();
const { getItems, createItem, getItem, patchItem, removeOne, addOne, createMultipleItems, getItemsByOrganization } = require('../controllers/practicaActiva');
const authMiddleware = require('../middleware/session');

router.get("/", authMiddleware(["all"]), getItems);

router.get("/remove", authMiddleware(["all"]), removeOne);

router.get("/add", authMiddleware(["all"]), addOne);

router.get("/id/:_id", authMiddleware(["all"]), getItem);

router.patch("/:_id", authMiddleware(["all"]), patchItem);

router.post("/registrar", authMiddleware(["all"]), createItem);

router.post("/registrar-multiple", authMiddleware(["all"]), createMultipleItems);

router.get("/by-organization", authMiddleware(["all"]), getItemsByOrganization);


module.exports = router;
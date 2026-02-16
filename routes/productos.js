const express = require('express');
const router = express.Router();
const { validatorCreateProductos, validatorGetProducto, validatorGetNombre, validatorGetEmp, validatorPatchProducto} = require('../validators/productosValidators');
const { getItems, createItem, getItem,   updateItem,   getItemsToDate, patchItem, getItemNombre, getItemByEmpresa} = require('../controllers/productos');
const authMiddleware = require('../middleware/session');

router.get("/", 
    authMiddleware(["all"]), 
    getItems
);

router.get("/id/:id_producto", authMiddleware(["all"]), validatorGetProducto, getItem);
router.get("/empresa/:empresa", validatorGetEmp, getItemByEmpresa);

router.get("/nombre/:nombre", authMiddleware(["all"]), validatorGetNombre, getItemNombre);
router.post("/registrar", authMiddleware(["all"]), validatorCreateProductos, createItem);

router.post("/updateEstado", authMiddleware(["all"]), validatorGetProducto, updateItem);
router.patch("/:id_producto", authMiddleware(["all"]), validatorPatchProducto, patchItem);

module.exports = router;

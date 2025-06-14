import express from "express";

import SupplierController from '../controllers/SupplierController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const supplierController = new SupplierController(); // Instância da classe

router
  .get("/suppliers", asyncWrapper(supplierController.listar.bind(supplierController)))
  .get("/suppliers/:id", asyncWrapper(supplierController.listar.bind(supplierController)))
  .post("/suppliers", asyncWrapper(supplierController.criar.bind(supplierController)))
  .patch("/suppliers/:id", asyncWrapper(supplierController.atualizar.bind(supplierController)))
  .delete("/suppliers/:id", asyncWrapper(supplierController.deletar.bind(supplierController)))

export default router;

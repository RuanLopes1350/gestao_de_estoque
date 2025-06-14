import express from "express";
import { asyncWrapper } from "../utils/helpers/index.js";
import FornecedorController from "../controllers/FornecedorController.js";

const router = express.Router();

const fornecedorController = new FornecedorController();

router
  .get(
    "/",
    asyncWrapper(fornecedorController.listar.bind(fornecedorController))
  )
  .get(
    "/:id",
    asyncWrapper(fornecedorController.buscarPorId.bind(fornecedorController))
  )
  .post(
    "/",
    asyncWrapper(fornecedorController.criar.bind(fornecedorController))
  )
  .put(
    "/:id",
    asyncWrapper(fornecedorController.atualizar.bind(fornecedorController))
  )
  .delete(
    "/:id",
    asyncWrapper(fornecedorController.deletar.bind(fornecedorController))
  );

export default router;

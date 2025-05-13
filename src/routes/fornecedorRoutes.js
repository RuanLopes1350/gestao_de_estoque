import express from "express";
import FornecedorController from "../controllers/FornecedorController";
import { asyncWrapper } from "../utils/helpers/index.js";

const router = express.Router();

const fornecedorController = new FornecedorController();

router
  .get(
    "/fornecedores",
    asyncWrapper(fornecedorController.listar.bind(fornecedorController))
  )
  .get(
    "/fornecedores/:id",
    asyncWrapper(fornecedorController.listar.bind(fornecedorController))
  )
  .post(
    "/fornecedores",
    asyncWrapper(fornecedorController.criar.bind(fornecedorController))
  )
  .put(
    "/fornecedores/:id",
    asyncWrapper(fornecedorController.atualizar.bind(fornecedorController))
  )
  .delete(
    "/fornecedores/:id",
    asyncWrapper(fornecedorController.deletar.bind(fornecedorController))
  );

export default router;

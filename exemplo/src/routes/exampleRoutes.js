import express from "express";
import ExampleController from "../controllers/ExampleController.js";
import { asyncWrapper } from '../utils/helpers/index.js';
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';

const router = express.Router();

const exampleController = new ExampleController(); // Instância da classe

router
  .get("/examples", asyncWrapper(exampleController.listar.bind(exampleController)))
  .get("/examples/:id", asyncWrapper(exampleController.listar.bind(exampleController)))
  // .post("/examples", AuthMiddleware, authPermission, asyncWrapper(exampleController.criar.bind(exampleController)))
  // .put("/examples/:id", AuthMiddleware, authPermission, asyncWrapper(exampleController.atualizar.bind(exampleController)))
  // .delete("/examples/:id", AuthMiddleware, authPermission, asyncWrapper(exampleController.deletar.bind(exampleController)))

export default router;

import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import TurmaController from "../controllers/TurmaController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const turmaController = new TurmaController(); // Instância da classe

router
  .get("/turmas", asyncWrapper(turmaController.listar.bind(turmaController)))
  .get("/turmas/:id", asyncWrapper(turmaController.listar.bind(turmaController)))
  .post("/turmas", asyncWrapper(turmaController.criar.bind(turmaController)))
  .put("/turmas/:id", asyncWrapper(turmaController.atualizar.bind(turmaController)))
  .delete("/turmas/:id", asyncWrapper(turmaController.deletar.bind(turmaController)))


export default router;
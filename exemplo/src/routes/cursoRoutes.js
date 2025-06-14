import express from "express";
import CursoController from "../controllers/CursoController.js";
import { asyncWrapper } from '../utils/helpers/index.js';
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';

const router = express.Router();

const cursoController = new CursoController(); // Instância da classe

router
  .get("/cursos", asyncWrapper(cursoController.listar.bind(cursoController)))
  .get("/cursos/:id", asyncWrapper(cursoController.listar.bind(cursoController)))
  .post("/cursos", AuthMiddleware, authPermission, asyncWrapper(cursoController.criar.bind(cursoController)))
  .put("/cursos/:id", AuthMiddleware, authPermission, asyncWrapper(cursoController.atualizar.bind(cursoController)))
  .delete("/cursos/:id", AuthMiddleware, authPermission, asyncWrapper(cursoController.deletar.bind(cursoController)))

export default router;

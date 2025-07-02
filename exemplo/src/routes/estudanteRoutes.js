import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import EstudanteController from '../controllers/EstudanteController.js';
import upload from "../config/multerConfig.js";
import csvFileValidator from "../middlewares/csvFileValidator.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const estudanteController = new EstudanteController(); // Instância da classe

router
  .get("/estudantes", asyncWrapper(estudanteController.listar.bind(estudanteController)))
  .get("/estudantes/:id", asyncWrapper(estudanteController.listar.bind(estudanteController)))
  
  .post("/estudantes", asyncWrapper(estudanteController.criar.bind(estudanteController)))
  .put("/estudantes/:id", asyncWrapper(estudanteController.atualizar.bind(estudanteController)))
  .delete("/estudantes/:id", asyncWrapper(estudanteController.deletar.bind(estudanteController)))
  
  .patch("/estudantes/inativar", asyncWrapper(estudanteController.InativarEstudantes.bind(estudanteController)))
  .post("/estudantes/upload", upload.single("file"), csvFileValidator, asyncWrapper(estudanteController.Upload.bind(estudanteController)))

export default router;

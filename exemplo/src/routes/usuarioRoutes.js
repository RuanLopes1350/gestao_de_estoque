import express from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import UsuarioController from '../controllers/UsuarioController.js';
import { asyncWrapper } from '../utils/helpers/index.js';


const router = express.Router();

const usuarioController = new UsuarioController(); // Instância da classe


router
  .get("/usuarios", AuthMiddleware, authPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
  .get("/usuarios/:id", AuthMiddleware, authPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
  .post("/usuarios", AuthMiddleware, authPermission, asyncWrapper(usuarioController.criar.bind(usuarioController)))
  .patch("/usuarios/:id", AuthMiddleware, authPermission, asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
  .delete("/usuarios/:id", AuthMiddleware, authPermission, asyncWrapper(usuarioController.deletar.bind(usuarioController)))

  // Foto do usuário
  .post("/usuarios/:id/foto", AuthMiddleware, authPermission, asyncWrapper(usuarioController.fotoUpload.bind(usuarioController)))
  .get("/usuarios/:id/foto", AuthMiddleware, authPermission, asyncWrapper(usuarioController.getFoto.bind(usuarioController)))

export default router;

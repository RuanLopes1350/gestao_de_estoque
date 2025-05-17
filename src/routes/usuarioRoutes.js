import express from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import UsuarioController from '../controllers/UsuarioController.js';

const router = express.Router();
const UsuarioController = new UsuarioController();

router
    .get(
        "/usuarios",
        asyncWrapper(UsuarioController.listarUsuario.bind(UsuarioController))
    )
    .get(
        "/usuarios/:matricula",
        asyncWrapper(UsuarioController.buscarUsuarioPorMatricula.bind(UsuarioController))
    )
    .post(
        "/usuarios",
        asyncWrapper(UsuarioController.cadastrarUsuario.bind(UsuarioController))
    )
    .put(
        "usuarios/:matricula",
        asyncWrapper(UsuarioController.deletarUsuario.bind(UsuarioController))
    )
    delete(
        "/usuarios/:matricula",
        asyncWrapper(UsuarioController.deletarUsuario.bind(UsuarioController))
    );

export default router;

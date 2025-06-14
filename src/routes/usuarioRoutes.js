import express from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const router = express.Router();
const usuarioController = new UsuarioController();

router
    // Rotas gerais primeiro
    .get(
        "/",
        asyncWrapper(usuarioController.listarUsuarios.bind(usuarioController))
    )
    .post(
        "/", 
        asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController))
    )
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "busca",
        asyncWrapper(usuarioController.buscarUsuarioPorMatricula.bind(usuarioController))
    )
    // Rotas com parâmetros por último
    .get(
        "/:matricula",
        asyncWrapper(usuarioController.buscarUsuarioPorID.bind(usuarioController))
    )
    .patch(
        "/:matricula",
        asyncWrapper(usuarioController.atualizarUsuario.bind(usuarioController))
    )
    .delete(
        "/:matricula",
        asyncWrapper(usuarioController.deletarUsuario.bind(usuarioController))
    );

export default router;
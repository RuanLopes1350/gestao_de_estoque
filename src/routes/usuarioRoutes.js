import express from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = express.Router();
const usuarioController = new UsuarioController(); 

router
    // Rotas gerais primeiro
    .get(
        "/",
        LogMiddleware.log('CONSULTA_USUARIOS'),
        asyncWrapper(usuarioController.listarUsuarios.bind(usuarioController))
    )
    .post(
        "/", 
        LogMiddleware.log('CADASTRO_USUARIO'),
        asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController))
    )
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "busca",
        LogMiddleware.log('BUSCA_USUARIO_MATRICULA'),
        asyncWrapper(usuarioController.buscarUsuarioPorMatricula.bind(usuarioController))
    )
    // Rotas com parâmetros por último
    .get(
        "/:matricula",
        LogMiddleware.log('CONSULTA_USUARIO'),
        asyncWrapper(usuarioController.buscarUsuarioPorID.bind(usuarioController))
    )
    //Rota para desativar usuario por id
    .patch(
        "/desativar/:id",
        LogMiddleware.log('DESATIVACAO_USUARIO'),
        asyncWrapper(usuarioController.desativarUsuario.bind(usuarioController))
    )
    .patch(
        "/:matricula",
        LogMiddleware.log('ATUALIZACAO_USUARIO'),
        asyncWrapper(usuarioController.atualizarUsuario.bind(usuarioController))
    )
    .delete(
        "/:matricula",
        LogMiddleware.log('EXCLUSAO_USUARIO'),
        asyncWrapper(usuarioController.deletarUsuario.bind(usuarioController))
    );

export default router;
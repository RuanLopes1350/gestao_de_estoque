import express from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const router = express.Router();
const usuarioController = new UsuarioController();

router
    // Rotas gerais primeiro
    .get(
        "/usuarios",
        asyncWrapper(usuarioController.listarUsuarios.bind(usuarioController))
    )
    .post(
        "/usuarios", 
        asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController))
    )
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "/usuarios/busca",
        asyncWrapper(usuarioController.buscarUsuarioPorMatricula.bind(usuarioController))
    )
    // Rotas com parâmetros por último
    .get(
        "/usuarios/:matricula",
        asyncWrapper(usuarioController.buscarUsuarioPorID.bind(usuarioController))
    )
    .patch(
        "/usuarios/:matricula",
        asyncWrapper(usuarioController.atualizarUsuario.bind(usuarioController))
    )
    .delete(
        "/usuarios/:matricula",
        asyncWrapper(usuarioController.deletarUsuario.bind(usuarioController))
    );

// Middleware para rotas inexistentes
router.use('/usuarios/*', (req, res) => {
    res.status(404).json({
        message: "Rota de usuário não encontrada",
        path: req.originalUrl
    });
});

export default router;
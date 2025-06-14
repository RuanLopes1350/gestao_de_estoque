import { Router } from 'express';
import MovimentacoesController from '../controllers/MovimentacoesController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();
const movimentacoesController = new MovimentacoesController();

// Middleware para autenticação
// router.use(authMiddleware);

router
    // Rotas sem parâmetros de rota primeiro
    .get(
        '/',
        asyncWrapper(movimentacoesController.listarMovimentacoes.bind(movimentacoesController))
    )
    .post(
        '/',
        asyncWrapper(movimentacoesController.cadastrarMovimentacao.bind(movimentacoesController))
    )
    // Rotas com query strings (busca e filtro)
    .get(
        '/busca',
        asyncWrapper(movimentacoesController.buscarMovimentacoes.bind(movimentacoesController))
    )
    .get(
        '/filtro',
        asyncWrapper(movimentacoesController.filtrarMovimentacoesAvancado.bind(movimentacoesController))
    )
    // Rotas com parâmetros de rota por último
    .get(
        '/:id',
        asyncWrapper(movimentacoesController.buscarMovimentacaoPorID.bind(movimentacoesController))
    )
    .patch(
        '/:id',
        asyncWrapper(movimentacoesController.atualizarMovimentacao.bind(movimentacoesController))
    )
    .delete(
        '/:id',
        asyncWrapper(movimentacoesController.deletarMovimentacao.bind(movimentacoesController))
    );



export default router;
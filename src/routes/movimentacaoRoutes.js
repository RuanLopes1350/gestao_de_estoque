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
        '/movimentacoes',
        asyncWrapper(movimentacoesController.listarMovimentacoes.bind(movimentacoesController))
    )
    .post(
        '/movimentacoes',
        asyncWrapper(movimentacoesController.cadastrarMovimentacao.bind(movimentacoesController))
    )
    // Rotas com query strings (busca e filtro)
    .get(
        '/movimentacoes/busca',
        asyncWrapper(movimentacoesController.buscarMovimentacoes.bind(movimentacoesController))
    )
    .get(
        '/movimentacoes/filtro',
        asyncWrapper(movimentacoesController.filtrarMovimentacoesAvancado.bind(movimentacoesController))
    )
    // Rotas com parâmetros de rota por último
    .get(
        '/movimentacoes/:id',
        asyncWrapper(movimentacoesController.buscarMovimentacaoPorID.bind(movimentacoesController))
    )
    .patch(
        '/movimentacoes/:id',
        asyncWrapper(movimentacoesController.atualizarMovimentacao.bind(movimentacoesController))
    )
    .delete(
        '/movimentacoes/:id',
        asyncWrapper(movimentacoesController.deletarMovimentacao.bind(movimentacoesController))
    );



export default router;
import express from 'express';
import ProdutoController from '../controllers/ProdutoController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const router = express.Router();
const produtoController = new ProdutoController();

router
    // Rotas gerais primeiro
    .get(
        "/produtos",
        asyncWrapper(produtoController.listarProdutos.bind(produtoController))
    )
    .post(
        "/produtos",
        asyncWrapper(produtoController.cadastrarProduto.bind(produtoController))
    )
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "/produtos/estoque-baixo",
        asyncWrapper(produtoController.listarEstoqueBaixo.bind(produtoController))
    )
    .get(
        "/produtos/busca",
        asyncWrapper(produtoController.buscarProdutosPorNome.bind(produtoController))
    )
    .patch(
        "/produtos/desativar/:id",
        asyncWrapper(produtoController.desativarProduto.bind(produtoController))
    )
    .patch(
        "/produtos/reativar/:id",
        asyncWrapper(produtoController.reativarProduto.bind(produtoController))
    )
    // Rotas com parâmetros por último
    .get(
        "/produtos/:id",
        asyncWrapper(produtoController.buscarProdutoPorID.bind(produtoController))
    )
    .patch(
        "/produtos/:id",
        asyncWrapper(produtoController.atualizarProduto.bind(produtoController))
    )
    .delete(
        "/produtos/:id",
        asyncWrapper(produtoController.deletarProduto.bind(produtoController))
    );

// Middleware para rotas inexistentes
router.use('/produtos/*', (req, res) => {
    res.status(404).json({
        message: "Rota de produto não encontrada",
        path: req.originalUrl
    });
});

export default router;
import express from 'express';
import ProdutoController from '../controllers/ProdutoController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const router = express.Router();
const produtoController = new ProdutoController();

router
    // Rotas gerais primeiro
    .get(
        "/",
        asyncWrapper(produtoController.listarProdutos.bind(produtoController))
    )
    .post(
        "/",
        asyncWrapper(produtoController.cadastrarProduto.bind(produtoController))
    )
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "/estoque-baixo",
        asyncWrapper(produtoController.listarEstoqueBaixo.bind(produtoController))
    )
    .get(
        "/busca",
        asyncWrapper(produtoController.buscarProdutos.bind(produtoController))
    )
    .patch(
        "/desativar/:id",
        asyncWrapper(produtoController.desativarProduto.bind(produtoController))
    )
    .patch(
        "/reativar/:id",
        asyncWrapper(produtoController.reativarProduto.bind(produtoController))
    )
    // Rotas com parâmetros por último
    .get(
        "/:id",
        asyncWrapper(produtoController.buscarProdutoPorID.bind(produtoController))
    )
    .patch(
        "/:id",
        asyncWrapper(produtoController.atualizarProduto.bind(produtoController))
    )
    .delete(
        "/:id",
        asyncWrapper(produtoController.deletarProduto.bind(produtoController))
    );



export default router;
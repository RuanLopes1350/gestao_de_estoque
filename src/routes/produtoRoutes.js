import express from 'express';
import ProdutoController from '../controllers/ProdutoController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const router = express.Router();
const produtoController = new ProdutoController();

router
    .get(
        "/produtos", asyncWrapper(produtoController.listarProdutos.bind(produtoController))
    )
    .get(
        "/produtos/:id",
        asyncWrapper(produtoController.buscarProdutoPorID.bind(produtoController))
    )
    .post(
        "/produtos",
        asyncWrapper(produtoController.cadastrarProduto.bind(produtoController))
    )
    .put(
        "/produtos/:id",
        asyncWrapper(produtoController.deletarProduto.bind(produtoController))
    )
    .delete(
        "/produtos/:id",
        asyncWrapper(produtoController.deletarProduto.bind(produtoController))
    );

export default router;
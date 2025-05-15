import express from 'express';
import ProdutoController from '../controllers/ProdutoController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const router = express.Router();
const produtoController = new ProdutoController();

router
    // Rota para buscar todos os produtos
    // Exemplo: produtos
    .get(
        "/produtos",
        asyncWrapper(produtoController.listarProdutos.bind(produtoController))
    )
    // Rota para buscar produtos com estoque baixo
    // Exemplo: produtos/estoque-baixo
    .get(
        "/produtos/estoque-baixo",
        asyncWrapper(produtoController.listarEstoqueBaixo.bind(produtoController))
    )
    // Rota para buscar produtos por nome
    // Exemplo: produtos/busca?nome=(nome que deseja buscar)
    .get(
        "/produtos/busca",
        asyncWrapper(produtoController.buscarProdutosPorNome.bind(produtoController))
    )
    // Rota para buscar produtos por ID
    // Exemplo: produtos/(id que deseja buscar)
    .get(
        "/produtos/:id",
        asyncWrapper(produtoController.buscarProdutoPorID.bind(produtoController))
    )
    // Rota para cadastrar um novo produto
    // Exemplo: produtos
    .post(
        "/produtos",
        asyncWrapper(produtoController.cadastrarProduto.bind(produtoController))
    )
    // Rota para atualizar um produto
    // Exemplo: produtos/(id que deseja atualizar)
    .patch(
        "/produtos/:id",
        asyncWrapper(produtoController.atualizarProduto.bind(produtoController))
    )
    // Rota para desativar um produto
    // Exemplo: produtos/desativar/(id que deseja desativar)
    .patch(
        "/produtos/desativar/:id",
        asyncWrapper(produtoController.desativarProduto.bind(produtoController))
    )
    .patch(
        "/produtos/reativar/:id",
        asyncWrapper(produtoController.reativarProduto.bind(produtoController))
    )
    // Rota para deletar um produto
    // Exemplo: produtos/(id que deseja deletar)
    .delete(
        "/produtos/:id",
        asyncWrapper(produtoController.deletarProduto.bind(produtoController))
    );

export default router;
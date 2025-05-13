import ProdutoService from "../services/produtoService.js";
// import { CommonResponse, HttpStatusCodes } from "../utils/helpers";

import CommonResponse from "../utils/helpers/CommonResponse.js";
import HttpStatusCodes from "../utils/helpers/HttpStatusCodes.js";

class ProdutoController {
    constructor() {
        this.service = new ProdutoService();
    }

    async cadastrarProduto(req, res) {
        try {
            const produtoNovo = await this.service.cadastrarProduto(req.body);
            return CommonResponse.created(
                res,
                produtoNovo,
                HttpStatusCodes.CREATED,
                "Produto cadastrado com sucesso!");
        } catch (erro) {
            return CommonResponse.error(res, erro);
        }
    }

    async listarProdutos(req, res) {
        const produtos = await this.service.buscarTodosProdutos(req);
        return CommonResponse.success(res, produtos);
    }

    async buscarProdutoPorID(req, res) {
        try {
            const { id } = req.params;
            const produto = await this.service.buscarProdutoPorID(id);
            return CommonResponse.success(
                res,
                produto,
                HttpStatusCodes.ACCEPTED,
                "Produto encontrado!");
        } catch (erro) {
            if (erro.statusCode) {
                return CommonResponse.error(res, erro.message, erro.statusCode);
            }
            return CommonResponse.error(res, erro.message || "Erro interno do servidor", HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async atualizarProduto(req, res) {
        try {
            const { id } = req.params; // Adicionar esta linha para obter o ID
            const produtoAtualizado = await this.service.atualizarProduto(id, req.body)
            return CommonResponse.success(
                res,
                produtoAtualizado,
                HttpStatusCodes.ACCEPTED,
                "Dados do produto atualizados com sucesso!"
            )
        } catch (erro) {
            return CommonResponse.error(res, erro);
        }
    }

    async deletarProduto(req, res) {
        try {
            const produtoDeletado = await this.service.deletarProduto(id)
            return CommonResponse.success(
                res,
                HttpStatusCodes.OK,
                "Produto deletado com sucesso!"
            )
        } catch (erro) {}
    }
}

export default ProdutoController;
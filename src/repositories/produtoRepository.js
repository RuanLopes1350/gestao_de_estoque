import mongoose from "mongoose";
import Produto from "../models/Produto.js";
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class ProdutoRepository {
    produtos = [];
    proximoId = 1;

    async buscarTodosProdutos() {
        return this.produtos;
    }

    async buscarProdutoPorID (id) {
        const produto = this.produtos.find(produto => produto.id === id);
        return produto || null;
    }

    async cadastrarProduto(criarProdutoDto) {
        const dataAgora = new Date();
        const novoProduto = {
            id: this.proximoId++,
            nome_produto: criarProdutoDto.nome_produto,
            descricao: criarProdutoDto.descricao,
            preco: criarProdutoDto.preco,
            marca: criarProdutoDto.marca,
            custo: criarProdutoDto.custo,
            categoria: criarProdutoDto.categoria,
            estoque: criarProdutoDto.estoque,
            estoque_min: criarProdutoDto.estoque_min,
            data_ultima_entrada: dataAgora,
            status: criarProdutoDto.status,
            id_fornecedor: criarProdutoDto.id_fornecedor,
            codigo_produto: criarProdutoDto.codigo_produto,
        }
        this.produtos.push(novoProduto);
        return novoProduto;
    }

    async atualizarProduto(id, atualizarProdutoDto) {
        const produtoIndex = this.produtos.findIndex(produto => produto.id === id);

        if(produtoIndex === -1) {
            return null;
        }

        const produtoAtualizado = {
            ...this.produtos[produtoIndex],
            ...atualizarProdutoDto,
            data_ultima_entrada: new Date(),
        }

        this.produtos[produtoIndex] = produtoAtualizado;
        return produtoAtualizado;
    }

    async deletarProduto(id) {
        const produtoIndex = this.produtos.findIndex(produto => this.produtos.id === id);

        if(produtoIndex === -1) {
            return false;
        }

        this.produtos.splice(produtoIndex, 1);
    }

}


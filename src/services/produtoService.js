import ProdutoRepository from '../repositories/produtoRepository.js';
import mongoose from 'mongoose';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';
import Produto from '../models/Produto.js';

class ProdutoService {
    constructor() {
        this.repository = new ProdutoRepository();
    }

    async listarProdutos(req) {
        console.log('Estou no listar em ProdutoService');
        const data = await this.repository.listarProdutos(req);
        console.log('Estou retornando os dados em ProdutoService');
        return data;
    }

    async cadastrarProduto(dadosProduto) {
        console.log('Estou no criar em ProdutoService');

        if (!dadosProduto.data_ultima_entrada) {
            dadosProduto.data_ultima_entrada = new Date();
        }

        if (dadosProduto.status === undefined) {
            dadosProduto.status = true;
        }

        const data = await this.repository.cadastrarProduto(dadosProduto);
        return data;
    }

    async atualizarProduto(id, dadosAtualizacao) {
        console.log('Atualizando produto:', id, dadosAtualizacao);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        const produtoAtualizado = await this.repository.atualizarProduto(id, dadosAtualizacao);
        return produtoAtualizado;
    }

    async buscarProdutoPorID(id) {
        console.log('Estou no buscarPorId em ProdutoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        const data = await this.repository.buscarProdutoPorID(id);
        return data;
    }

    async buscarProdutosPorNome(nome) {
        console.log('Estou no buscarProdutosPorNome em ProdutoService');

        if (!nome || nome.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'nome',
                details: [],
                customMessage: 'Nome de produto válido é obrigatório para busca.'
            });
        }

        const req = {
            params: {},
            query: {
                nome_produto: nome
            }
        };

        const data = await this.repository.listarProdutos(req);
        return data;
    }

    // Adicione esses novos métodos
    async buscarProdutosPorCategoria(categoria) {
        console.log('Estou no buscarProdutosPorCategoria em ProdutoService');

        if (!categoria || categoria.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'categoria',
                details: [],
                customMessage: 'Categoria válida é obrigatória para busca.'
            });
        }

        const req = {
            params: {},
            query: {
                categoria: categoria
            }
        };

        const data = await this.repository.listarProdutos(req);
        return data;
    }

    async buscarProdutosPorCodigo(codigo) {
        console.log('Estou no buscarProdutosPorCodigo em ProdutoService');

        if (!codigo || codigo.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'codigo_produto',
                details: [],
                customMessage: 'Código de produto válido é obrigatório para busca.'
            });
        }

        const req = {
            params: {},
            query: {
                codigo_produto: codigo
            }
        };

        const data = await this.repository.listarProdutos(req);
        return data;
    }

    async buscarProdutosPorFornecedor(id_fornecedor) {
        console.log('Estou no buscarProdutosPorFornecedor em ProdutoService');

        if (!id_fornecedor) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id_fornecedor',
                details: [],
                customMessage: 'ID de fornecedor válido é obrigatório para busca.'
            });
        }

        const req = {
            params: {},
            query: {
                id_fornecedor: id_fornecedor
            }
        };

        const data = await this.repository.listarProdutos(req);
        return data;
    }

    async deletarProduto(id) {
        console.log('Estou no deletar em ProdutoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        try {
            const data = await this.repository.deletarProduto(id);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async listarEstoqueBaixo() {
        console.log('Estou no listarEstoqueBaixo em ProdutoService');
        const data = await this.repository.listarEstoqueBaixo();
        return data;
    }

    async desativarProduto(id) {
        console.log('Estou no desativarProduto em ProdutoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        const data = await this.repository.desativarProduto(id);
        return data;
    }

    async reativarProduto(id) {
        console.log('Estou no reativarProduto em ProdutoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        const data = await this.repository.reativarProduto(id);
        return data;
    }
}

export default ProdutoService;
import ProdutoRepository from '../repositories/produtoRepository.js';
import mongoose from 'mongoose';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

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

    async atualizarProduto(id, dadosProduto) {
        console.log('Estou no atualizar em ProdutoService');
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }
        
        const data = await this.repository.atualizarProduto(id, dadosProduto);
        return data;
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
        
        // Criar um objeto de requisição simulado com o filtro de nome
        const req = {
            params: {}, // Adicione um objeto params vazio para evitar erros
            query: {
                nome_produto: nome
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
}

export default ProdutoService;
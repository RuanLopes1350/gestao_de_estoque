import ProdutoService from '../services/produtoService.js'
import { ProdutoQuerySchema, ProdutoIdSchema } from '../utils/validators/schemas/zod/querys/ProdutoQuerySchema.js';
import { ProdutoSchema, ProdutoUpdateSchema } from '../utils/validators/schemas/zod/ProdutoSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class ProdutoController {
    constructor() {
        this.service = new ProdutoService();
    }

    async listarProdutos(req, res) {
        console.log('Estou no listarProdutos em ProdutoController');

        try {
            const { id } = req.params || {};
            if (id) {
                ProdutoIdSchema.parse(id);
            }

            const query = req.query || {};
            if (Object.keys(query).length !== 0) {
                await ProdutoQuerySchema.parseAsync(query);
            }

            const data = await this.service.listarProdutos(req);
            return CommonResponse.success(res, data);
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async buscarProdutoPorID(req, res) {
        console.log('Estou no buscarProdutoPorID em ProdutoController');

        try {
            const { id } = req.params || {};
            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do produto é obrigatório.'
                });
            }

            ProdutoIdSchema.parse(id);
            const data = await this.service.buscarProdutoPorID(id);
            return CommonResponse.success(res, data, 200, 'Produto encontrado com sucesso.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async buscarProdutosPorNome(req, res) {
        console.log('Estou no buscarProdutosPorNome em ProdutoController');
    
        try {
            const query = req.query || {};
            if (!query.nome) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'nome',
                    details: [],
                    customMessage: 'O parâmetro nome é obrigatório para esta busca.'
                });
            }
            
            const data = await this.service.buscarProdutosPorNome(query.nome);
            return CommonResponse.success(res, data, 200, 'Produtos encontrados com sucesso.');
        } catch (error) {
            console.error('Erro na busca por nome:', error);
            return CommonResponse.error(res, error);
        }
    }

    async cadastrarProduto(req, res) {
        console.log('Estou no cadastrarProduto em ProdutoController');

        try {
            // Valida os dados do produto
            const parsedData = ProdutoSchema.parse(req.body);
            const data = await this.service.cadastrarProduto(parsedData);
            return CommonResponse.created(res, data, HttpStatusCodes.CREATED.code, 'Produto cadastrado com sucesso.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async atualizarProduto(req, res) {
        console.log('Estou no atualizarProduto em ProdutoController');

        try {
            const { id } = req.params || {};
            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do produto é obrigatório para atualizar.'
                });
            }

            ProdutoIdSchema.parse(id);
            const parsedData = ProdutoUpdateSchema.parse(req.body);
            const data = await this.service.atualizarProduto(id, parsedData);
            return CommonResponse.success(res, data, 200, 'Produto atualizado com sucesso.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async deletarProduto(req, res) {
        console.log('Estou no deletarProduto em ProdutoController');
    
        try {
            const { id } = req.params || {};
            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do produto é obrigatório para deletar.'
                });
            }
    
            try {
                ProdutoIdSchema.parse(id);
            } catch (error) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do produto inválido.'
                });
            }
    
            const data = await this.service.deletar(id);
            return CommonResponse.success(res, data, 200, 'Produto excluído com sucesso.');
        } catch (error) {
            if (error.statusCode === 404) {
                return CommonResponse.error(
                    res, 
                    error.statusCode, 
                    error.errorType, 
                    error.field,
                    error.details,
                    'Produto não encontrado. Verifique se o ID está correto.'
                );
            }
            return CommonResponse.error(res, error);
        }
    }

    async listarEstoqueBaixo(req, res) {
        console.log('Estou no listarEstoqueBaixo em ProdutoController');

        try {
            const data = await this.service.listarEstoqueBaixo();
            return CommonResponse.success(res, data, 200, 'Lista de produtos com estoque baixo.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }
}

export default ProdutoController;
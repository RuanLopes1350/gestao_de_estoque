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

            // Verificar se a lista está vazia
            if (data.docs && data.docs.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    'Nenhum produto encontrado com os critérios informados.'
                );
            }

            return CommonResponse.success(res, data);
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async buscarProdutoPorID(req, res) {
        console.log('Estou no buscarProdutoPorID em ProdutoController');

        try {
            const { id } = req.params || {};


            ProdutoIdSchema.parse(id);
            const data = await this.service.buscarProdutoPorID(id);
            return CommonResponse.success(res, data, 200, 'Produto encontrado com sucesso.');
        } catch (error) {
            if (error.statusCode === 404 || error.message.includes('not found')) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    'Produto não encontrado. Verifique se o ID está correto.'
                );
            }
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

            // Verificar se a busca retornou resultados
            if (data.docs && data.docs.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    `Nenhum produto encontrado com o nome: ${query.nome}`
                );
            }

            return CommonResponse.success(res, data, 200, 'Produtos encontrados com sucesso.');
        } catch (error) {
            console.error('Erro na busca por nome:', error);
            return CommonResponse.error(res, error);
        }
    }

    // Adicione esses novos métodos
    async buscarProdutosPorCategoria(req, res) {
        console.log('Estou no buscarProdutosPorCategoria em ProdutoController');

        try {
            const query = req.query || {};
            if (!query.categoria) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'categoria',
                    details: [],
                    customMessage: 'O parâmetro categoria é obrigatório para esta busca.'
                });
            }

            const data = await this.service.buscarProdutosPorCategoria(query.categoria);

            if (data.docs && data.docs.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    `Nenhum produto encontrado na categoria: ${query.categoria}`
                );
            }

            return CommonResponse.success(res, data, 200, 'Produtos encontrados com sucesso.');
        } catch (error) {
            console.error('Erro na busca por categoria:', error);
            return CommonResponse.error(res, error);
        }
    }

    async buscarProdutosPorCodigo(req, res) {
        console.log('Estou no buscarProdutosPorCodigo em ProdutoController');

        try {
            const query = req.query || {};
            if (!query.codigo) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'codigo',
                    details: [],
                    customMessage: 'O parâmetro codigo é obrigatório para esta busca.'
                });
            }

            const data = await this.service.buscarProdutosPorCodigo(query.codigo);

            if (data.docs && data.docs.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    `Nenhum produto encontrado com o código: ${query.codigo}`
                );
            }

            return CommonResponse.success(res, data, 200, 'Produtos encontrados com sucesso.');
        } catch (error) {
            console.error('Erro na busca por código:', error);
            return CommonResponse.error(res, error);
        }
    }

    async buscarProdutosPorFornecedor(req, res) {
        console.log('Estou no buscarProdutosPorFornecedor em ProdutoController');

        try {
            const query = req.query || {};
            if (!query.fornecedor) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'fornecedor',
                    details: [],
                    customMessage: 'O parâmetro fornecedor é obrigatório para esta busca.'
                });
            }

            const data = await this.service.buscarProdutosPorFornecedor(query.fornecedor);

            if (data.docs && data.docs.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    `Nenhum produto encontrado para o fornecedor ID: ${query.fornecedor}`
                );
            }

            return CommonResponse.success(res, data, 200, 'Produtos encontrados com sucesso.');
        } catch (error) {
            console.error('Erro na busca por fornecedor:', error);
            return CommonResponse.error(res, error);
        }
    }

    async cadastrarProduto(req, res) {
        console.log('Estou no cadastrarProduto em ProdutoController');

        try {
            const parsedData = ProdutoSchema.parse(req.body);
            const data = await this.service.cadastrarProduto(parsedData);
            return CommonResponse.created(res, data, HttpStatusCodes.CREATED.code, 'Produto cadastrado com sucesso.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async atualizarProduto(req, res) {
        console.log('Estou no atualizarProduto em ProdutoController');
        console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
        console.log('ID do produto:', req.params.id);

        try {
            const { id } = req.params;
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

            const dadosAtualizacao = req.body;

            // Verifica se há dados para atualizar
            if (Object.keys(dadosAtualizacao).length === 0) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'body',
                    details: [],
                    customMessage: 'Nenhum dado fornecido para atualização.'
                });
            }

            await ProdutoUpdateSchema.parseAsync(dadosAtualizacao);

            const produtoAtualizado = await this.service.atualizarProduto(id, dadosAtualizacao);

            console.log('Produto atualizado:', produtoAtualizado);

            return CommonResponse.success(
                res,
                produtoAtualizado,
                200,
                'Produto atualizado com sucesso.'
            );
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
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

            const data = await this.service.deletarProduto(id);
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

            // Verificar se há produtos com estoque baixo
            if (!data || data.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    'Nenhum produto com estoque baixo encontrado.'
                );
            }

            return CommonResponse.success(res, data, 200, 'Lista de produtos com estoque baixo.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async desativarProduto(req, res) {
        console.log('Estou no desativarProduto em ProdutoController');

        try {
            const { id } = req.params || {};
            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do produto é obrigatório para desativar.'
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

            const data = await this.service.desativarProduto(id);
            return CommonResponse.success(res, data, 200, 'Produto desativado com sucesso.');
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

    async reativarProduto(req, res) {
        console.log('Estou no reativarProduto em ProdutoController');

        try {
            const { id } = req.params || {};
            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do produto é obrigatório para reativar.'
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

            const data = await this.service.reativarProduto(id);
            return CommonResponse.success(res, data, 200, 'Produto reativado com sucesso.');
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
}

export default ProdutoController;
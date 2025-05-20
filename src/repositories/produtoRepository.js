import mongoose from 'mongoose';
import Produto from '../models/Produto.js';
import { CustomError, messages } from '../utils/helpers/index.js';
import ProdutoFilterBuilder from './filters/ProdutoFilterBuilder.js';

class ProdutoRepository {
    constructor({ model = Produto } = {}) {
        this.model = model;
    }

    async listarProdutos(req) {
        console.log('Estou no listar em ProdutoRepository');
    
        const id = req.params ? req.params.id : null;
    
        if (id) {
            const data = await this.model.findById(id)
                .populate('id_fornecedor');
    
            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Produto',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Produto')
                });
            }
    
            return data;
        }
    
        // Para busca por filtros
        const { nome_produto, categoria, codigo_produto, id_fornecedor, nome_fornecedor, page = 1 } = req.query || {};
        const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);
    
        const filtros = {};
    
        if (nome_produto) {
            filtros.nome_produto = { $regex: nome_produto, $options: 'i' };
            console.log(`Aplicando filtro por nome: "${nome_produto}"`);
        }
    
        if (categoria) {
            filtros.categoria = { $regex: categoria, $options: 'i' };
            console.log(`Aplicando filtro por categoria: "${categoria}"`);
        }
    
        if (codigo_produto) {
            filtros.codigo_produto = { $regex: codigo_produto, $options: 'i' };
            console.log(`Aplicando filtro por código: "${codigo_produto}"`);
        }
    
        if (id_fornecedor) {
            // Como id_fornecedor é um Number no modelo, convertemos para número
            filtros.id_fornecedor = parseInt(id_fornecedor);
            console.log(`Aplicando filtro por ID de fornecedor: "${id_fornecedor}"`);
        }
    
        // Adicionando suporte para busca por nome do fornecedor
        if (nome_fornecedor) {
            // Para esta busca, precisamos primeiro encontrar o ID do fornecedor pelo nome
            // e depois buscar produtos que têm esse ID
            const Fornecedor = mongoose.model('fornecedores');
            const fornecedores = await Fornecedor.find({
                nome_fornecedor: { $regex: nome_fornecedor, $options: 'i' }
            }).select('_id');
            
            // Extrair os ids numéricos para pesquisa
            if (fornecedores.length > 0) {
                const fornecedorIds = fornecedores.map(f => {
                    // Extraindo um ID numérico do ObjectId do MongoDB
                    const tempId = f._id.toString().substring(0, 8);
                    return parseInt(tempId, 16) % 1000;
                });
                
                // Usar $in para buscar produtos de qualquer um dos fornecedores encontrados
                filtros.id_fornecedor = { $in: fornecedorIds };
                console.log(`Aplicando filtro por nome de fornecedor: "${nome_fornecedor}" (IDs: ${fornecedorIds.join(', ')})`);
            } else {
                // Se não encontrar nenhum fornecedor, retornar lista vazia
                console.log(`Nenhum fornecedor encontrado com o nome: "${nome_fornecedor}"`);
                return {
                    docs: [],
                    totalDocs: 0,
                    limit: limite,
                    totalPages: 0,
                    page: parseInt(page, 10),
                    pagingCounter: 0,
                    hasPrevPage: false,
                    hasNextPage: false,
                    prevPage: null,
                    nextPage: null
                };
            }
        }
    
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            populate: 'id_fornecedor',
            sort: { nome_produto: 1 },
        };
    
        console.log('Filtros aplicados:', filtros);
        const resultado = await this.model.paginate(filtros, options);
        return resultado;
    }

    async buscarProdutoPorID(id) {
        const produto = await this.model.findById(id);
        if (!produto) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Produto',
                details: [],
                customMessage: messages.error.resourceNotFound('Produto')
            });
        }
        return produto;
    }

    async cadastrarProduto(dadosProduto) {
        const produtoExistente = await this.model.findOne({ codigo_produto: dadosProduto.codigo_produto });
        if (produtoExistente) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'codigo_produto',
                details: [],
                customMessage: 'Já existe um produto com este código.'
            });
        }

        const produto = new this.model(dadosProduto);
        return await produto.save();
    }

    async atualizarProduto(id, dadosProduto) {
        console.log('Repositório - atualizando produto:', id);
        console.log('Dados de atualização:', JSON.stringify(dadosProduto, null, 2));

        // Verifique se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido'
            });
        }

        if (dadosProduto.codigo_produto) {
            const produtoExistente = await this.model.findOne({
                codigo_produto: dadosProduto.codigo_produto,
                _id: { $ne: id }
            });

            if (produtoExistente) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'codigo_produto',
                    details: [],
                    customMessage: 'Este código já está sendo usado por outro produto.'
                });
            }
        }

        // Garantir que estamos usando as opções corretas
        const produto = await this.model.findByIdAndUpdate(
            id,
            dadosProduto,
            { new: true, runValidators: true }
        );

        console.log('Resultado da atualização:', produto ? 'Sucesso' : 'Falha');

        if (!produto) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Produto',
                details: [],
                customMessage: 'Produto não encontrado'
            });
        }

        return produto;
    }

    async deletarProduto(id) {
        const produto = await this.model.findByIdAndDelete(id);
        if (!produto) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Produto',
                details: [],
                customMessage: messages.error.resourceNotFound('Produto')
            });
        }
        return produto;
    }

    async listarEstoqueBaixo() {
        return await this.model.find({
            $expr: { $lt: ["$estoque", "$estoque_min"] }
        }).sort({ estoque: 1 });
    }

    async desativarProduto(id) {
        const produto = await this.model.findByIdAndUpdate (
            id,
            { status: false },
            { new: true }
        );
        return produto;
    }

    async reativarProduto(id) {
        const produto = await this.model.findByIdAndUpdate (
            id,
            { status: true },
            { new: true }
        );
        return produto;
    }
}

export default ProdutoRepository;
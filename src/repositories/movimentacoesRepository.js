import mongoose from 'mongoose';
import Movimentacao from '../models/Movimentacao.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class MovimentacaoRepository {
    constructor({ model = Movimentacao } = {}) {
        this.model = model;
    }

    async listarMovimentacoes(req) {
        console.log('Estou no listarMovimentacoes em MovimentacaoRepository');
        
        const id = req.params ? req.params.id : null;
        
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID da movimentação inválido'
                });
            }
            
            const data = await this.model.findById(id)
                .populate('id_usuario')
                .populate('produtos.produto_ref');
                
            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Movimentacao',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Movimentação')
                });
            }
            
            return data;
        }
        
        // Para busca por filtros
        const { 
            tipo, 
            data_inicio, 
            data_fim, 
            produto, 
            usuario, 
            page = 1 
        } = req.query || {};
        
        const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);
        
        const filtros = {};
        
        if (tipo) {
            filtros.tipo = tipo;
            console.log(`Aplicando filtro por tipo: "${tipo}"`);
        }
        
        if (data_inicio && data_fim) {
            filtros.data_movimentacao = { 
                $gte: new Date(data_inicio),
                $lte: new Date(data_fim)
            };
            console.log(`Aplicando filtro por período: de ${data_inicio} até ${data_fim}`);
        }
        
        if (produto) {
            // Verificar se o produto é um ID válido ou nome/código
            if (mongoose.Types.ObjectId.isValid(produto)) {
                filtros['produtos.produto_ref'] = produto;
                console.log(`Aplicando filtro por referência de produto: "${produto}"`);
            } else {
                // Busca por código ou nome do produto
                filtros.$or = [
                    { 'produtos.codigo_produto': { $regex: produto, $options: 'i' } },
                    { 'produtos.nome_produto': { $regex: produto, $options: 'i' } }
                ];
                console.log(`Aplicando filtro por nome/código de produto: "${produto}"`);
            }
        }
        
        if (usuario) {
            // Verificar se o usuário é um ID válido ou nome
            if (mongoose.Types.ObjectId.isValid(usuario)) {
                filtros.id_usuario = usuario;
                console.log(`Aplicando filtro por ID de usuário: "${usuario}"`);
            } else {
                filtros.nome_usuario = { $regex: usuario, $options: 'i' };
                console.log(`Aplicando filtro por nome de usuário: "${usuario}"`);
            }
        }
        
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            sort: { data_movimentacao: -1 }, // Mais recente primeiro
            populate: ['id_usuario', 'produtos.produto_ref']
        };
        
        console.log('Filtros aplicados:', filtros);
        const resultado = await this.model.paginate(filtros, options);
        console.log(`Encontradas ${resultado.docs?.length || 0} movimentações`);
        return resultado;
    }

    async buscarMovimentacaoPorID(id) {
        console.log('Estou no buscarMovimentacaoPorID em MovimentacaoRepository');
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação inválido'
            });
        }
        
        const movimentacao = await this.model.findById(id)
            .populate('id_usuario')
            .populate('produtos.produto_ref');
            
        if (!movimentacao) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Movimentacao',
                details: [],
                customMessage: 'Movimentação não encontrada'
            });
        }
        
        return movimentacao;
    }

    async cadastrarMovimentacao(dadosMovimentacao) {
        console.log('Estou no cadastrarMovimentacao em MovimentacaoRepository');
        
        try {
            const movimentacao = new this.model(dadosMovimentacao);
            const resultado = await movimentacao.save();
            console.log('Movimentação cadastrada com sucesso');
            return resultado;
        } catch (error) {
            console.error('Erro ao cadastrar movimentação:', error);
            
            if (error.name === 'ValidationError') {
                const detalhes = Object.keys(error.errors).map(campo => ({
                    campo: campo,
                    mensagem: error.errors[campo].message
                }));
                
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'Movimentacao',
                    details: detalhes,
                    customMessage: 'Dados de movimentação inválidos'
                });
            }
            
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Movimentacao',
                details: [],
                customMessage: messages.error.internalServerError('ao cadastrar movimentação')
            });
        }
    }

    async atualizarMovimentacao(id, dadosAtualizacao) {
        console.log('Estou no atualizarMovimentacao em MovimentacaoRepository');
        console.log('Dados de atualização:', JSON.stringify(dadosAtualizacao, null, 2));
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação inválido'
            });
        }
        
        try {
            const movimentacaoAtualizada = await this.model.findByIdAndUpdate(
                id,
                dadosAtualizacao,
                { new: true, runValidators: true }
            ).populate('id_usuario').populate('produtos.produto_ref');
            
            console.log('Resultado da atualização:', movimentacaoAtualizada ? 'Sucesso' : 'Falha');
            
            if (!movimentacaoAtualizada) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Movimentacao',
                    details: [],
                    customMessage: 'Movimentação não encontrada'
                });
            }
            
            return movimentacaoAtualizada;
        } catch (error) {
            console.error('Erro ao atualizar movimentação:', error);
            
            if (error instanceof CustomError) {
                throw error;
            }
            
            if (error.name === 'ValidationError') {
                const detalhes = Object.keys(error.errors).map(campo => ({
                    campo: campo,
                    mensagem: error.errors[campo].message
                }));
                
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'Movimentacao',
                    details: detalhes,
                    customMessage: 'Dados de atualização inválidos'
                });
            }
            
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Movimentacao',
                details: [],
                customMessage: messages.error.internalServerError('ao atualizar movimentação')
            });
        }
    }

    async deletarMovimentacao(id) {
        console.log('Estou no deletarMovimentacao em MovimentacaoRepository');
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação inválido'
            });
        }
        
        const movimentacao = await this.model.findByIdAndDelete(id);
        
        if (!movimentacao) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Movimentacao',
                details: [],
                customMessage: messages.error.resourceNotFound('Movimentação')
            });
        }
        
        console.log('Movimentação excluída com sucesso');
        return movimentacao;
    }
}

export default MovimentacaoRepository;
// src/repositories/UsuarioRepository.js

import mongoose from 'mongoose';
import UsuarioFilterBuilder from './filters/UsuarioFilterBuilder.js';
import UsuarioModel from '../models/Usuario.js';
import GrupoModel from '../models/Grupo.js';
import UnidadeModel from '../models/Unidade.js';
import RotaModel from '../models/Rota.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class UsuarioRepository {
    constructor({
        usuarioModel = UsuarioModel,
        grupoModel = GrupoModel,
        unidadeModel = UnidadeModel,
        rotaModel = RotaModel
    } = {}) {
        this.model = usuarioModel;
        this.grupoModel = grupoModel;
        this.unidadeModel = unidadeModel;
        this.rotaModel = rotaModel;
    }



    /**
     * Obter combinações únicas de rota e domínio a partir das permissões.
     */
    async obterParesRotaDominioUnicos(permissoes) {
        const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio || 'undefined'}`);
        const combinacoesUnicas = [...new Set(combinacoes)];
        return combinacoesUnicas.map(combinacao => {
            const [rota, dominio] = combinacao.split('_');
            return { rota, dominio: dominio === 'undefined' ? null : dominio };
        });
    }

    /**
     * Obter permissões duplicadas na requisição.
     */
    async obterPermissoesDuplicadas(permissoes, combinacoesRecebidas) {
        return permissoes.filter((p, index) =>
            combinacoesRecebidas.indexOf(`${p.rota}_${p.dominio || 'undefined'}`) !== index
        );
    }

    /**
     * Buscar usuário por email e, opcionalmente, por um ID diferente.
     */
    async buscarPorEmail(email, idIgnorado = null) {
        const filtro = { email };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        }

        const documento = await this.model.findOne(filtro, '+senha')
            .populate({
                path: 'grupos',
                populate: { path: 'unidades' }
            })
            .populate('permissoes')
            .populate('unidades');

        return documento;
    }

    /**
     * Método buscar por ID - Deve ser chamado por controllers ou services para retornar
     * um usuário e ser utilizado em outras funções de validação cujo listar não atende por exigir req.
     */
    async buscarPorId(id, includeTokens = false) {
        let query = this.model.findById(id);

        if (includeTokens) {
            query = query.select('+refreshtoken +accesstoken');
        }
        const user = await query;
        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        return user;
    }

    /**
     * Método buscar por permissão para saber se a permissão existe no cadastro de rotas e domínios.
     * O método deve buscar combinando rota e domínio.
     */
    async buscarPorPermissao(permissoes) {
        const query = permissoes.map(p => ({
            rota: p.rota,
            dominio: p.dominio || null
        }));
        const rotasEncontradas = await this.rotaModel.find({ $or: query });
        return rotasEncontradas;
    }

    /**
     * Método listar usuário com suporte a filtros, paginação e enriquecimento com estatísticas.
     */
    async listar(req) {
        console.log('Estou no listar em UsuarioRepository');
        const id = req.params.id || null;

        // Se um ID for fornecido, retorna o usuário enriquecido com estatísticas
        if (id) {
            const data = await this.model.findById(id)
                .populate({
                    path: 'grupos',
                    populate: { path: 'unidades' }
                })
                .populate('permissoes')
                .populate('unidades');

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Usuário',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuário')
                });
            }

            // Utilizando o length dos arrays
            const totalGrupos = data.grupos ? data.grupos.length : 0;
            const totalUnidades = data.unidades ? data.unidades.length : 0;
            const totalPermissoes = data.permissoes ? data.permissoes.length : 0;
            const dataWithStats = {
                ...data.toObject(),
                estatisticas: {
                    totalGrupos,
                    totalUnidades,
                    totalPermissoes
                }
            };
            return dataWithStats;
        }

        // Caso não haja ID, retorna todos os usuários com suporte a filtros e paginação
        const { nome, email, ativo, grupo, unidade, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        const filterBuilder = new UsuarioFilterBuilder()
            .comNome(nome || '')
            .comEmail(email || '')
            .comAtivo(ativo || '');

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.internalServerError('Usuário')
            });
        }

        await filterBuilder.comGrupo(grupo);
        await filterBuilder.comUnidade(unidade);
        const filtros = filterBuilder.build();

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            populate: [
                {
                    path: 'grupos',
                    populate: { path: 'unidades' }
                },
                'permissoes',
                'unidades'
            ],
            sort: { nome: 1 },
        };

        const resultado = await this.model.paginate(filtros, options);

        // Enriquecer cada usuário com estatísticas utilizando o length dos arrays
        resultado.docs = resultado.docs.map(doc => {
            const usuarioObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

            const totalGrupos = usuarioObj.grupos ? usuarioObj.grupos.length : 0;
            const totalUnidades = usuarioObj.unidades ? usuarioObj.unidades.length : 0;
            const totalPermissoes = usuarioObj.permissoes ? usuarioObj.permissoes.length : 0;

            return {
                ...usuarioObj,
                estatisticas: {
                    totalGrupos,
                    totalUnidades,
                    totalPermissoes
                }
            };
        });

        return resultado;
    }

    // Método criar usuário
    async criar(dadosUsuario) {
        const usuario = new this.model(dadosUsuario);
        return await usuario.save();
    }

    // Método atualizar usuário
    async atualizar(id, parsedData) {
        const usuario = await this.model.findByIdAndUpdate(id, parsedData, { new: true })
            .populate([
                {
                    path: 'grupos',
                    populate: { path: 'unidades' }
                },
                'permissoes',
                'unidades'
            ])
            .exec();

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        return usuario;
    }

    // Método deletar usuário
    async deletar(id) {
        const usuario = await this.model.findByIdAndDelete(id);
        return usuario;
    }
}

export default UsuarioRepository;

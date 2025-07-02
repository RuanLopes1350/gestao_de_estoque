// src/repositories/UnidadeRepository.js

import UnidadeModel from '../models/Unidade.js';
import UnidadeFilterBuilder from './filters/UnidadeFilterBuilder.js';
import { CustomError, messages } from '../utils/helpers/index.js';


class UnidadeRepository {
    constructor() {
        this.model = UnidadeModel;
    }
    /**
     * metodos assincrono para bUscar Total de grupos associados a uma unidade
     */
    async buscarTotalGruposAssociados(idUnidade) {
        const grupos = await UnidadeModel.aggregate([
            {
                $match: { _id: idUnidade }
            },
            {
                $lookup: {
                    from: 'grupos',
                    localField: '_id',
                    foreignField: 'unidades',
                    as: 'grupos'
                }
            },
            {
                $unwind: '$grupos'
            },
            {
                $group: {
                    _id: '$_id',
                    total: { $sum: 1 }
                }
            }
        ]);
        return grupos;
    }


    /**
     * Método assíncrono para buscar o total de usuários associados a uma unidade.
     */
    async buscarTotalUsuariosAssociados(idUnidade) {
        const usuarios = await UnidadeModel.aggregate([
            {
                $match: { _id: idUnidade }
            },
            {
                $lookup: {
                    from: 'usuarios',
                    localField: '_id',
                    foreignField: 'unidades',
                    as: 'usuarios'
                }
            },
            {
                $unwind: '$usuarios'
            },
            {
                $group: {
                    _id: '$_id',
                    total: { $sum: 1 }
                }
            }
        ]);
        return usuarios
    }


    /**
     * Buscar grupo por nome e, opcionalmente, por um ID diferente.
     */
    async buscarPorNome(nome, localidade = null, idDiferente = null) {
        const filtro = { nome };
        if (idDiferente) {
            filtro._id = { $ne: idDiferente }; // Adiciona a condição _id != idDiferente
        }
        if (localidade) {
            filtro.localidade = localidade;
        }
        const documento = await this.model.findOne(filtro);
        return documento;
    }

    /**
     * Método buscar por ID - Deve ser chamado por controllers ou services.
     * para retornar um usuário e ser utilizado em outras funções de validação
     * cujo listar não atende por exigir req.
     */
    async buscarPorId(id) {
        const unit = await this.model.findById(id);
        if (!unit) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Unidade',
                details: [],
                customMessage: messages.error.resourceNotFound('Unidade')
            });
        }
        return unit;
    }

    async listar(req) {
        const id = req?.params?.id || null;

        // Se um ID for fornecido, retorna a unidade correspondente enriquecida com estatísticas
        if (id) {
            const data = await this.model.findById(id);
            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Unidade',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Unidade'),
                });
            }
            // Buscar estatísticas para a unidade única
            const gruposResult = await this.buscarTotalGruposAssociados(data._id);
            const totalGrupos = gruposResult.length ? gruposResult[0].total : 0;

            const usuariosResult = await this.buscarTotalUsuariosAssociados(data._id);
            const totalUsuarios = usuariosResult.length ? usuariosResult[0].total : 0;

            console.log('totalGrupos', totalGrupos);

            // Converter para objeto simples (caso seja um documento do Mongoose) e adicionar estatísticas
            const dataWithStats = {
                ...data.toObject(),
                estatisticas: {
                    totalGrupos,
                    totalUsuarios
                }
            };
            return dataWithStats;
        }

        // Caso não haja ID, retorna todas as unidades com suporte a filtros e paginação
        const { nome, localidade, ativo, page = 1 } = req.query || {};

        // Garantir que o limite não ultrapasse 100
        const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);

        // Construir os filtros usando o filter builder
        const filterBuilder = new UnidadeFilterBuilder()
            .comNome(nome)
            .comLocalidade(localidade)
            .comAtivo(ativo);

        // Validação do filtro de unidade para evitar erro de cast
        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Unidade',
                details: [],
                customMessage: messages.error.internalServerError('Unidade'),
            });
        }

        // Construir os filtros e as opções de paginação
        const filtros = filterBuilder.build();
        const options = {
            page: parseInt(page),
            limit: parseInt(limite),
            sort: { nome: 1 },
        };

        // Realizar a busca no banco de dados
        const resultado = await this.model.paginate(filtros, options);

        // Enriquecer cada documento com estatísticas
        resultado.docs = await Promise.all(resultado.docs.map(async (doc) => {
            // Caso o documento seja um documento Mongoose, converta-o para objeto simples
            const unidadeObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

            const gruposResult = await this.buscarTotalGruposAssociados(unidadeObj._id);
            const totalGrupos = gruposResult.length ? gruposResult[0].total : 0;

            const usuariosResult = await this.buscarTotalUsuariosAssociados(unidadeObj._id);
            const totalUsuarios = usuariosResult.length ? usuariosResult[0].total : 0;

            return {
                ...unidadeObj,
                estatisticas: {
                    totalGrupos,
                    totalUsuarios
                }
            };
        }));

        return resultado;
    }


    async criar(dadosUnidade) {
        const unidade = new this.model(dadosUnidade);
        return await unidade.save();
    }

    /**
     * Atualiza uma unidade existente.
     */
    async atualizar(id, dadosAtualizados) {
        const unidade = await this.model.findByIdAndUpdate(id, dadosAtualizados, { new: true });

        // Validar se a unidade  atualizada foi retornada
        if (!unidade) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Unidade',
                details: [],
                customMessage: messages.error.resourceNotFound('Unidade'),
            });
        }

        return unidade;
    }

    /**
     * Método para deletar uma unidade existente.
     */
    async deletar(id) {
        const unidadeDeletada = await this.model.findByIdAndDelete(id);

        // Validação de grupo deletado foi retornado
        if (!unidadeDeletada) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Unidade',
                details: [],
                customMessage: messages.error.resourceNotFound('Unidade')
            });
        }
        return unidadeDeletada;
    }

    /**
     * Verificar se há usuários associados a unidade.
     */
    async verificarUsuariosAssociados(id) {
        const usuariosAssociados = await UsuarioModel.findOne({ unidades: id });
        return usuariosAssociados;
    }
}


export default UnidadeRepository;

// src/repositories/SupplierRepository.js

import SupplierFilterBuilder from './filters/SupplierFilterBuilder.js';
import SupplierModel from '../models/Supplier.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes,
    errorHandler,
    messages,
    StatusService,
    asyncWrapper
} from '../utils/helpers/index.js';

class SupplierRepository {
    constructor({
        supplierModel = SupplierModel,
    } = {}) {
        this.model = supplierModel;
    }


    /**
     * Buscar usuário por email e, opcionalmente, por um ID diferente.
     */
    async buscarPorEmail(email, idIgnorado = null) {
        const filtro = { email };
        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        }
        const documento = await this.model.findOne(filtro, '+senha');
        return documento;
    }

    /**
     * Buscar usuário por CNPJ e, opcionalmente, por um ID diferente.
     */
    async buscarPorCnpj(cnpj, idIgnorado = null) {
        const filtro = { cnpj };
        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        }
        const documento = await this.model.findOne(filtro);
        return documento;
    }

    /**
     * Buscar usuário por telefone e, opcionalmente, por um ID diferente.
     */
    async buscarPorTelefone(telefone, idIgnorado = null) {
        const filtro = { telefone };
        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        }
        const documento = await this.model.findOne(filtro);
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
     * Método listar usuário com suporte a filtros, paginação e enriquecimento com estatísticas.
     */
    async listar(req) {
        console.log('Estou no listar em SupplierRepository');
        const id = req.params.id || null;

        // Se um ID for fornecido, retorna o usuário enriquecido com estatísticas
        if (id) {
            const data = await this.model.findById(id)

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Usuário',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuário')
                });
            }

            return data;
        }

        // Caso não haja ID, retorna todos os usuários com suporte a filtros e paginação
        const {
            nome,
            email,
            ativo,
            cnpj,
            telefone } = req.query || {};

        const page = parseInt(req.query.page, 10) || 1;

        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        const filterBuilder = new SupplierFilterBuilder()
            .comNome(nome || '')
            .comEmail(email || '')
            .comAtivo(ativo || '')
            .comCnpj(cnpj || '')
            .comTelefone(telefone || '')


        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.internalServerError('Usuário')
            });
        }

        const filtros = filterBuilder.build();

        const options = {
            page: parseInt(page),
            limit: parseInt(limite),
            sort: { nome: 1 },
        };

        const resultado = await this.model.paginate(filtros, options);

        // Enriquecer cada usuário com estatísticas utilizando o length dos arrays
        resultado.docs = resultado.docs.map(doc => {
            const supplierObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
            return {
                ...supplierObj,
            };
        });

        return resultado;
    }

    // Método criar usuário
    async criar(dadosSupplier) {
        const supplier = new this.model(dadosSupplier);
        return await supplier.save();
    }

    // Método atualizar usuário
    async atualizar(id, parsedData) {
        const supplier = await this.model.findByIdAndUpdate(id, parsedData, { new: true }).exec();

        if (!supplier) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        return supplier;
    }

    // Método deletar usuário
    async deletar(id) {
        const supplier = await this.model.findByIdAndDelete(id);
        return supplier;
    }
}

export default SupplierRepository;

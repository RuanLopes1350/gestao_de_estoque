// src/repositories/ExampleRepository.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import ExampleModel from '../models/Example.js';
import ExampleFilterBuilder from './filters/ExampleFilterBuilder.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class ExampleRepository {
    constructor({
        model = ExampleModel
    } = {}) {
        this.model = model;
    }

    async listar(req) {
        console.log('Listando examples em ExampleRepository');

        const { id } = req.params || null;

        if (id) {
            console.log('Buscando example por ID:', id);

            const data = await this.model.findById(id);
            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Example',
                    customMessage: messages.error.resourceNotFound('Example'),
                });
            }
            return data;
        }

        const { nome, codigo, descricao, page = 1 } = req.query;
        const limit = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        const filterBuilder = new ExampleFilterBuilder()
            .comNome(nome)
            .comCodigo(codigo)
            .comDescricao(descricao)

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Example',
                customMessage: messages.error.internalServerError('Example'),
            });
        }

        const filtros = filterBuilder.build();

        const options = {
            page: parseInt(page),
            limit: parseInt(limit, 10),
            sort: { nome: 1 },
        };

        return await this.model.paginate(filtros, options)
    }

    // async criar(dados) {
    //     const example = new this.model(dados);
    //     return await example.save();
    // }

    // async atualizar(id, dados) {
    //     const example = await this.model.findByIdAndUpdate(id, dados, { new: true });
    //     if (!example) {
    //         throw new CustomError({
    //             statusCode: 404,
    //             errorType: 'resourceNotFound',
    //             field: 'Example',
    //             customMessage: messages.error.resourceNotFound('Example'),
    //         });
    //     }
    //     return example;
    // }

    // async deletar(id) {
    //     /**
    //      *  TODO
    //      * VERIFIQCAR SE O CURSO ESTÁ EM USO EM TURMA 
    //      * Ùnica referencia no momento da construção deste metodo
    //      */



    //     const example = await this.model.findByIdAndDelete(id);
    //     return example;
    // }

    async buscarPorId(id) {
        const example = await this.model.findById(id);
        if (!example) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Example',
                customMessage: messages.error.resourceNotFound('Example'),
            });
        }
        return example;
    }

    // buscar por nome
    async buscarPorNome(nome, idIgnorado = null) {
        // Criar o filtro base
        const filtro = { nome };

        // Adicionar a condição para excluir o ID, se fornecido
        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado }; // Adiciona a condição _id != idIgnorado
        }

        // Consultar o documento no banco de dados
        const documento = await this.model.findOne(filtro);

        // Retornar o documento encontrado
        return documento;
    }
}

export default ExampleRepository;

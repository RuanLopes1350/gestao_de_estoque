// src/repositories/CursoRepository.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import CursoModel from '../models/Curso.js';
import CursoFilterBuilder from './filters/CursoFilterBuilder.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class CursoRepository {
    constructor({
        model = CursoModel
    } = {}) {
        this.model = model;
    }

    async listar(req) {
        console.log('Listando cursos em CursoRepository');

        const { id } = req.params || null;

        if (id) {
            console.log('Buscando curso por ID:', id);

            const data = await this.model.findById(id);
            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Curso',
                    customMessage: messages.error.resourceNotFound('Curso'),
                });
            }
            return data;
        }

        const { nome, codigo, page = 1 } = req.query;
        const limit = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        const filterBuilder = new CursoFilterBuilder()
            .comNome(nome)
            .comCodigo(codigo);

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Curso',
                customMessage: messages.error.internalServerError('Curso'),
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

    async criar(dados) {
        const curso = new this.model(dados);
        return await curso.save();
    }

    async atualizar(id, dados) {
        const curso = await this.model.findByIdAndUpdate(id, dados, { new: true });
        if (!curso) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Curso',
                customMessage: messages.error.resourceNotFound('Curso'),
            });
        }
        return curso;
    }

    async deletar(id) {
        /**
         *  TODO
         * VERIFIQCAR SE O CURSO ESTÁ EM USO EM TURMA 
         * Ùnica referencia no momento da construção deste metodo
         */



        const curso = await this.model.findByIdAndDelete(id);
        return curso;
    }

    async buscarPorId(id) {
        const curso = await this.model.findById(id);
        if (!curso) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Curso',
                customMessage: messages.error.resourceNotFound('Curso'),
            });
        }
        return curso;
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

export default CursoRepository;

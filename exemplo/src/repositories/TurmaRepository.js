// src/repositories/TurmaRepository.js

import TurmaModel from '../models/Turma.js';
import { CustomError, messages } from '../utils/helpers/index.js';
import CursoRepository from '../repositories/CursoRepository.js';
import TurmaFilterBuilder from './filters/TurmaFilterBuilder.js';

class TurmaRepository {
    constructor({ model = TurmaModel } = {}) {
        this.model = model;
    }

    // Método para listar turmas, podendo buscar por ID ou aplicar filtros simples (codigo_suap, descricao e curso)
    async listar(req) {
        console.log('Estou no listar em TurmaRepository');
        const { id } = req.params || null;
        if (id) {
            const turma = await this.model.findById(id)
                .populate('curso');
            if (!turma) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Turma',
                    customMessage: messages.error.resourceNotFound('Turma'),
                });
            }
            return turma;
        }

        const { codigo_suap, descricao, curso, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        console.log(req.query);

        const filterBuilder = new TurmaFilterBuilder()
            .comCodigoSuap(codigo_suap || '')
            .comDescricao(descricao || '')

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Turma',
                details: [],
                customMessage: messages.error.internalServerError('Turma')
            });
        }

        await filterBuilder.comCurso(curso || '');

        const filtros = filterBuilder.build();

        const options = {
            page: parseInt(page),
            limit: parseInt(limite),
            populate: 'curso',
            sort: { descricao: 1 },
        };

        const resultado = await this.model.paginate(filtros, options);
        return resultado;
    }

    // Método para criar uma nova turma
    async criar(dadosTurma) {
        const turma = new this.model(dadosTurma);
        return await turma.save();
    }

    // Método para atualizar uma turma existente
    async atualizar(id, dadosAtualizados) {
        const turma = await this.model.findByIdAndUpdate(id, dadosAtualizados, { new: true })
            .populate('curso');

        if (!turma) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Turma',
                customMessage: messages.error.resourceNotFound('Turma'),
            });
        }
        return turma;
    }

    // Método para deletar uma turma
    async deletar(id) {
        const turma = await this.model.findByIdAndDelete(id);
        return turma;
    }

    // Método para buscar uma turma por ID, com populate do campo curso
    async buscarPorId(id) {
        const turma = await this.model.findById(id).populate('curso');
        if (!turma) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Turma',
                customMessage: messages.error.resourceNotFound('Turma'),
            });
        }
        return turma;
    }
}

export default TurmaRepository;

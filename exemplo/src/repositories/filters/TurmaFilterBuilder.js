// src/utils/TurmaFilterBuilder.js

import CursoRepository from '../../repositories/CursoRepository.js';
import { Types } from 'mongoose';

class TurmaFilterBuilder {
    constructor() {
        this.filtros = {};
        this.cursoRepository = new CursoRepository();
    }

    // Filtra pela propriedade codigo_suap usando regex (busca case-insensitive)
    comCodigoSuap(codigoSuap) {
        if (codigoSuap) {
            this.filtros.codigo_suap = { $regex: codigoSuap, $options: 'i' };
        }
        return this;
    }

    // Filtra pela propriedade descricao usando regex (busca case-insensitive)
    comDescricao(descricao) {
        if (descricao) {
            this.filtros.descricao = { $regex: descricao, $options: 'i' };
        }
        return this;
    }

    // Filtra pela referência de curso. Se o valor for um ObjectID válido, utiliza-o diretamente;
    // caso contrário, faz a busca pelo nome.
    async comCurso(curso) {
        if (curso) {
            console.log('Curso recebido:', curso);
            if (Types.ObjectId.isValid(curso)) {
                console.log('Curso é um ObjectId válido');
                this.filtros.curso = curso;
                const cursoEncontrado = await this.cursoRepository.buscarPorId(curso);
                if (!cursoEncontrado) {
                    this.filtros.curso = { $in: [] };
                }
            } else if (typeof curso === 'string') {
                console.log('Curso é uma string');
                const regexCurso = new RegExp(this.escapeRegex(curso), 'i');
                // Pode inicialmente definir um regex, mas vamos buscar pelo nome
                let cursosEncontrados = await this.cursoRepository.buscarPorNome(curso);
                // Se não for array, converta para array (se for objeto ou outro valor truthy)
                if (cursosEncontrados && !Array.isArray(cursosEncontrados)) {
                    cursosEncontrados = [cursosEncontrados];
                }
                if (cursosEncontrados && cursosEncontrados.length > 0) {
                    this.filtros.curso = { $in: cursosEncontrados.map(c => c._id) };
                } else {
                    this.filtros.curso = { $in: [] };
                }
            }
        }
        return this;
    }



    // Método utilitário para escapar caracteres especiais em regex
    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    // Retorna o objeto de filtros construído
    build() {
        return this.filtros;
    }
}

export default TurmaFilterBuilder;

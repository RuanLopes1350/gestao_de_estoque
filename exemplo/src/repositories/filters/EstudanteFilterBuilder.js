// src/repositories/filters/EstudanteFilterBuilder.js
import { Types } from 'mongoose';
import Turma from '../../models/Turma.js';

class EstudanteFilterBuilder {
  constructor() {
    this.filtros = {};
  }

  /**
   * Filtra por matrícula (busca regex, case-insensitive).
   */
  comMatricula(matricula) {
    if (matricula) {
      this.filtros.matricula = { $regex: matricula, $options: 'i' };
    }
    return this;
  }

  /**
   * Filtra por nome (busca regex, case-insensitive).
   */
  comNome(nome) {
    if (nome) {
      this.filtros.nome = { $regex: nome, $options: 'i' };
    }
    return this;
  }

  /**
   * Filtra por turma. Pode receber:
   * 1) Um ObjectId (string válida), neste caso filtra direto em turma_id.
   * 2) Uma string (por exemplo, parte de código_suap), então busca a Turma correspondente
   *    e filtra pelo _id encontrado. Se não existir, força filtro que retorna vazio.
   */
  async comTurma(turma) {
    if (!turma) {
      return this;
    }

    // Se o texto for um ObjectId válido, usa direto em turma_id
    if (Types.ObjectId.isValid(turma)) {
      this.filtros.turma_id = turma;
      const existe = await Turma.findById(turma);
      if (!existe) {
        // Força filtro sem resultados
        this.filtros.turma_id = { $in: [] };
      }
    } else {
      // Caso seja texto (por exemplo, parte do código_suap)
      const turmaEncontrada = await Turma.findOne({
        codigo_suap: { $regex: turma, $options: 'i' },
      });
      if (turmaEncontrada) {
        this.filtros.turma_id = turmaEncontrada._id;
      } else {
        this.filtros.turma_id = { $in: [] };
      }
    }

    return this;
  }

  /**
   * Retorna o objeto de filtros construído. 
   * Ex.: { matricula: /.../i, nome: /.../i, turma_id: ObjectId(...) }
   */
  build() {
    return this.filtros;
  }
}

export default EstudanteFilterBuilder;

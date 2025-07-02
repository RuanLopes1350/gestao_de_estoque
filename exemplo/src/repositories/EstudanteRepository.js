// src/repositories/EstudanteRepository.js
import EstudanteModel from '../models/Estudante.js';
import { CustomError, messages } from '../utils/helpers/index.js';
import EstudanteFilterBuilder from './filters/EstudanteFilterBuilder.js';

class EstudanteRepository {
  constructor({ model = EstudanteModel } = {}) {
    this.model = model;
  }

  /**
   * Listar estudantes (com paginação e filtros). 
   * Se req.params.id existir, retorna apenas aquele estudante (populando turma_id e cursos_id). 
   * Senão, aplica filtros de matrícula, nome e turma (via EstudanteFilterBuilder).
   */
  async listar(req) {
    const { id } = req.params || {};

    // ********** Caso GET /estudantes/:id **********
    if (id) {
      const estudante = await this.model
        .findById(id)
        // Popula exatamente o campo string do schema (turma_id e cursos_id).
        .populate('turma_id')
        .populate('cursos_id');
      if (!estudante) {
        throw new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'Estudante',
          customMessage: messages.error.resourceNotFound('Estudante'),
        });
      }
      return estudante;
    }

    // ********** Caso GET /estudantes sem id (listagem paginada/filtros) **********
    const { matricula, nome, turma, page = 1 } = req.query;
    // Limita no máximo 100 por página
    const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

    // Monta os filtros usando o builder
    const filterBuilder = new EstudanteFilterBuilder()
      .comMatricula(matricula || '')
      .comNome(nome || '');

    // Atenção: comTurma agora filtra em turma_id
    await filterBuilder.comTurma(turma || '');
    const filtros = filterBuilder.build();

    const options = {
      page: parseInt(page, 10),
      limit: limite,
      // Popula ambos os refs para que o JSON de saída já venha com os objetos completos
      populate: ['turma_id', 'cursos_id'],
      sort: { nome: 1 },
    };

    const resultado = await this.model.paginate(filtros, options);
    return resultado;
  }

  /**
   * Cria um novo estudante. Espera um objeto contendo:
   *   { matricula, nome, cursos_id, turma_id, ativo? }
   */
  async criar(dadosEstudante) {
    const estudante = new this.model(dadosEstudante);
    return await estudante.save();
  }

  /**
   * Atualiza um estudante existente (por ID). 
   * Retorna o documento atualizado já populado em turma_id e cursos_id.
   */
  async atualizar(id, dadosAtualizados) {
    const estudante = await this.model
      .findByIdAndUpdate(id, dadosAtualizados, { new: true })
      // Popula novamente os dois campos referenciados
      .populate('turma_id')
      .populate('cursos_id');

    if (!estudante) {
      throw new CustomError({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Estudante',
        customMessage: messages.error.resourceNotFound('Estudante'),
      });
    }
    return estudante;
  }

  /**
   * Deleta um estudante pelo ID. Retorna o documento excluído ou null se não existir.
   */
  async deletar(id) {
    return await this.model.findByIdAndDelete(id);
  }

  /**
   * Busca um estudante por ID (populando turma_id e cursos_id). 
   * Emite erro 404 se não for encontrado.
   */
  async buscarPorId(id) {
    const estudante = await this.model
      .findById(id)
      .populate('turma_id')
      .populate('cursos_id');
    if (!estudante) {
      throw new CustomError({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Estudante',
        customMessage: messages.error.resourceNotFound('Estudante'),
      });
    }
    return estudante;
  }
}

export default EstudanteRepository;

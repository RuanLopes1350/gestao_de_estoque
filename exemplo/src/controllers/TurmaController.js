// src/controllers/TurmaController.js

import TurmaService from '../services/TurmaService.js';
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  errorHandler,
  messages,
  StatusService,
  asyncWrapper
} from '../utils/helpers/index.js';

import { TurmaQuerySchema, TurmaIdSchema } from '../utils/validators/schemas/zod/querys/TurmaQuerySchema.js';
import { TurmaSchema, TurmaUpdateSchema } from '../utils/validators/schemas/zod/TurmaSchema.js';

class TurmaController {
  constructor() {
    this.service = new TurmaService();
  }

  // GET /turmas ou /turmas/:id
  async listar(req, res) {
    console.log('Estou no listar em TurmaController');

    // Validação do ID (se existir)
    const { id } = req.params || null;
    if (id) {
      TurmaIdSchema.parse(id);
    }

    // Validação das queries (se existirem)
    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await TurmaQuerySchema.parseAsync(query);
    }

    const data = await this.service.listar(req);
    return CommonResponse.success(res, data);
  }

  // POST /turmas
  async criar(req, res) {
    try {
      // Opcional: validar o corpo da requisição com TurmaSchema.parse(req.body);
      const data = await this.service.criar(req.body);
      return CommonResponse.created(res, data, HttpStatusCodes.CREATED, 'Turma adicionada com sucesso!');
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  // GET /turmas/:id
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      TurmaIdSchema.parse(id);
      const data = await this.service.buscarPorId(id);
      return CommonResponse.success(res, data, HttpStatusCodes.OK, 'Turma encontrada com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  // PUT /turmas/:id
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      // Opcional: validar o corpo da requisição com TurmaUpdateSchema.parse(req.body);
      const data = await this.service.atualizar(id, req.body);
      return CommonResponse.success(res, data, HttpStatusCodes.OK, 'Turma atualizada com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  // DELETE /turmas/:id
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const data = await this.service.deletar(id);
      return CommonResponse.success(res, data, HttpStatusCodes.OK, 'Turma deletada com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }
}

export default TurmaController;

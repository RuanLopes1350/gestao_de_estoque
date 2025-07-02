// src/controllers/CursoController.js

import CursoService from '../services/CursoService.js';
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  errorHandler,
  messages,
  StatusService,
  asyncWrapper
} from '../utils/helpers/index.js';

import { CursoQuerySchema, CursoIdSchema } from '../utils/validators/schemas/zod/querys/CursoQuerySchema.js';
import { CursoSchema, CursoUpdateSchema } from '../utils/validators/schemas/zod/CursoSchema.js';

class CursoController {
  constructor() {
    this.service = new CursoService();
  }

  // GET /cursos ou /cursos/:id
  async listar(req, res) {
    console.log('Estou no listar em CursoController');

    // Validação do ID (se existir)
    const { id } = req.params || null;
    if (id) {
      CursoIdSchema.parse(id);
    }

    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      // Valida as queries (se existirem)
      await CursoQuerySchema.parseAsync(query);
    }

    const data = await this.service.listar(req);
    return CommonResponse.success(res, data);
  }

  // POST /cursos
  async criar(req, res) {
    try {
      const data = await this.service.criar(req.body);
      return CommonResponse.created(res, data);
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  // PUT /cursos/:id
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const data = await this.service.atualizar(id, req.body);
      return CommonResponse.success(res, data, 200, 'Curso atualizado com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  // DELETE /cursos/:id
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const data = await this.service.deletar(id);
      return CommonResponse.success(res, data, 200, 'Curso excluído com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }
}

export default CursoController;

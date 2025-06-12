// src/controllers/ExampleController.js

import ExampleService from '../services/ExampleService.js';
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  errorHandler,
  messages,
  StatusService,
  asyncWrapper
} from '../utils/helpers/index.js';

import { ExampleQuerySchema, ExampleIdSchema } from '../utils/validators/schemas/zod/querys/ExampleQuerySchema.js';
import { ExampleSchema, ExampleUpdateSchema } from '../utils/validators/schemas/zod/ExampleSchema.js';

class ExampleController {
  constructor() {
    this.service = new ExampleService();
  }

  // GET /examples ou /examples/:id
  async listar(req, res) {
    console.log('Estou no listar em ExampleController');

    // Validação do ID (se existir)
    const { id } = req.params || null;
    if (id) {
      ExampleIdSchema.parse(id);
    }

    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      // Valida as queries (se existirem)
      await ExampleQuerySchema.parseAsync(query);
    }

    const data = await this.service.listar(req);
    return CommonResponse.success(res, data);
  }

  // // POST /examples
  // async criar(req, res) {
  //   try {
  //     const data = await this.service.criar(req.body);
  //     return CommonResponse.created(res, data);
  //   } catch (error) {
  //     return CommonResponse.error(res, error);
  //   }
  // }

  // // PUT /examples/:id
  // async atualizar(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const data = await this.service.atualizar(id, req.body);
  //     return CommonResponse.success(res, data, 200, 'Example atualizado com sucesso.');
  //   } catch (error) {
  //     return CommonResponse.error(res, error);
  //   }
  // }

  // // DELETE /examples/:id
  // async deletar(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const data = await this.service.deletar(id);
  //     return CommonResponse.success(res, data, 200, 'Example excluído com sucesso.');
  //   } catch (error) {
  //     return CommonResponse.error(res, error);
  //   }
  // }
}

export default ExampleController;

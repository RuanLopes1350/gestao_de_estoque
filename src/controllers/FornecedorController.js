import FornecedorService from "../services/fornecedorService.js";
import CommonResponse from "../utils/helpers/CommonResponse.js";
import HttpStatusCodes from "../utils/helpers/HttpStatusCodes.js";
import { FornecedorIdSchema } from "../utils/validators/schemas/zod/querys/FornecedorQuerySchema.js";

class FornecedorController {
  constructor() {
    this.service = new FornecedorService();
  }

  //POST /fornecedores
  async criar(req, res) {
    try {
      const data = await this.service.criar(req.body);
      return CommonResponse.created(
        res,
        data,
        HttpStatusCodes.CREATED.code,
        "Fornecedor adicionado"
      );
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  // GET /fornecedores ou /fornecedores/:id
  async listar(req, res) {
    const data = await this.service.listar(req);
    return CommonResponse.success(res, data);
  }

  // GET /fornecedores/:id
  async buscarPorId(req, res) {
    try {
      const { id } = req.params || {};
      FornecedorIdSchema.parse(id);
      const data = await this.service.buscarPorId(id);
      return CommonResponse.success(
        res,
        data,
        200,
        "Fornecedor encontrado com sucesso."
      );
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  // PUT /fornecedores/:id
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const data = await this.service.atualizar(id, req.body);
      return CommonResponse.success(
        res,
        data,
        HttpStatusCodes.OK.code,
        "Fornecedor atualizada com sucesso."
      );
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  // DELETE /fornecedores/:id
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const data = await this.service.deletar(id);
      return CommonResponse.success(
        res,
        data,
        HttpStatusCodes.OK.code,
        "Fornecedor eliminado com sucesso."
      );
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  async desativarFornecedor(req, res) {
    console.log("Estou no desativarFornecedor em FornecedorController");
    try {
      const { id } = req.params || {};
      if (!id) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "id",
          details: [],
          customMessage: "ID do fornecedor é obrigatório para desativar.",
        });
      }

      try {
        FornecedorIdSchema.parse(id);
      } catch (error) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "id",
          details: [],
          customMessage: "ID do fornecedor inválido.",
        });
      }

      const data = await this.service.desativarFornecedor(id);
      return CommonResponse.success(
        res,
        data,
        200,
        "fornecedor desativado com sucesso."
      );
    } catch (error) {
      if (error.statusCode === 404) {
        return CommonResponse.error(
          res,
          error.statusCode,
          error.errorType,
          error.field,
          error.details,
          "fornecedor não encontrado. Verifique se o ID está correto."
        );
      }
      return CommonResponse.error(res, error);
    }
  }

  async reativarFornecedor(req, res) {
    console.log("Estou no reativarFornecedor em FornecedorController");
    try {
      const { id } = req.params || {};
      if (!id) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "id",
          details: [],
          customMessage: "ID do fornecedor é obrigatório para reativar.",
        });
      }

      try {
        FornecedorIdSchema.parse(id);
      } catch (error) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "id",
          details: [],
          customMessage: "ID do fornecedor inválido.",
        });
      }

      const data = await this.service.reativarFornecedor(id);
      return CommonResponse.success(
        res,
        data,
        200,
        "fornecedor reativado com sucesso."
      );
    } catch (error) {
      if (error.statusCode === 404) {
        return CommonResponse.error(
          res,
          error.statusCode,
          error.errorType,
          error.field,
          error.details,
          "fornecedor não encontrado. Verifique se o ID está correto."
        );
      }
      return CommonResponse.error(res, error);
    }
  }
}
export default FornecedorController;

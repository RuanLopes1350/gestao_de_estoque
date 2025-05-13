import { Fornecedor as FornecedorModel } from "../models/Fornecedor.js";
import FornecedorFilterBuilder from "./filters/FornecedorFilterBuilder.js";

class FornecedorRepository {
  constructor({ model = FornecedorModel } = {}) {
    this.model = model;
  }

  async criar(dadosFornecedor) {
    const fornecedor = new this.model(dadosFornecedor);
    return await fornecedor.save();
  }

  // Método para listar turmas, podendo buscar por ID ou aplicar filtros simples (codigo_suap, descricao e curso)
  async listar(req) {
    const { id } = req.params || null;
    if (id) {
      const fornecedor = await this.model.findById(id);
      if (!fornecedor) {
        throw new CustomError({
          statusCode: 404,
          errorType: "resourceNotFound",
          field: "Fornecedor",
          customMessage: messages.error.resourceNotFound("Fornecedor"),
        });
      }
      return fornecedor;
    }

    const { cnpj, nome_fornecedor, page = 1 } = req.query;
    const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

    const filterBuilder = new FornecedorFilterBuilder()
      .comCNPJ(cnpj || "")
      .comNome(nome_fornecedor || "");

    if (typeof filterBuilder.build !== "function") {
      throw new CustomError({
        statusCode: 500,
        errorType: "internalServerError",
        field: "Fornecedor",
        details: [],
        customMessage: messages.error.internalServerError("Turma"),
      });
    }
    const filtros = filterBuilder.build();

    const resultado = await this.model.paginate(filtros, options);
    return resultado;
  }

  // Método para buscar um fornecedor por ID
  async buscarPorId(id) {
    const fornecedor = await this.model.findById(id);
    if (!fornecedor) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "Fornecedor",
        customMessage: messages.error.resourceNotFound("Fornecedor"),
      });
    }
    return fornecedor;
  }
}
export default FornecedorRepository;

import mongoose from "mongoose";
import FornecedorRepository from "../repositories/fornecedorRepository.js";

class FornecedorService {
  constructor() {
    this.repository = new FornecedorRepository();
  }

  // POST /fornecedores
  async criar(dados) {
    const data = await this.repository.criar(dados);
    return data;
  }

  // GET /fornecedores ou /fornecedores/:id
  async listar(req) {
    const data = await this.repository.listar(req);
    return data;
  }

  // GET /fornecedores/:id
  async buscarPorId(id) {
    const data = await this.repository.buscarPorId(id);
    return data;
  }

  // PUT /fornecedores/:id
  async atualizar(id, dados) {
    const data = await this.repository.atualizar(id, dados);
    return data;
  }

  // DELETE /fornecedores/:id
  async deletar(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'id',
            details: [],
            customMessage: 'ID do fornecedor inválido.'
        });
    }
    const data = await this.repository.deletar(id);
    return data;
  }
}

export default FornecedorService;

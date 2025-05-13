import FornecedorRepository from "../repositories/FornecedorRepository";
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
}

export default FornecedorService;

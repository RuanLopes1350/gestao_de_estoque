import FornecedorRepository from "../repositories/FornecedorRepository";
class FornecedorService {
  constructor() {
    this.repository = new TurmaRepository();
  }

  // POST /fornecedores
  async criar(dados) {
    const data = await this.repository.criar(dados);
    return data;
  }
}

export default FornecedorService;

import { Fornecedor } from "../models/Fornecedor";

class FornecedorRepository {
  constructor({ model = Fornecedor } = {}) {
    this.model = model;
  }

  async criar(dadosFornecedor) {
    const fornecedor = new this.model(dadosFornecedor);
    return await fornecedor.save();
  }
}
export default FornecedorRepository;

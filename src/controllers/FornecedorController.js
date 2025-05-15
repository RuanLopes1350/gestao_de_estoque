import FornecedorService from "../services/FornecedorService";

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
        HttpStatusCodes.CREATED,
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
      const data = await this.service.buscarPorId(id);
      return CommonResponse.success(
        res,
        data,
        HttpStatusCodes.OK,
        "Turma encontrada com sucesso."
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
        HttpStatusCodes.OK,
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
        HttpStatusCodes.OK,
        "Fornecedor deletada com sucesso."
      );
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }
}
export default FornecedorController;

class FornecedorController {
  constructor() {
    this.service = new TurmaService();
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
}
export default FornecedorController;

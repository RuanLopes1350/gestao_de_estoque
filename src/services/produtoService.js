import ProdutoRepository from "../repositories/produtoRepository.js";
class ProdutoService {
    constructor() {
        this.repository = new ProdutoRepository();
    }

    async cadastrarProduto(dadosProduto) {
        const produtoNovo = await this.repository.cadastrarProduto(dadosProduto);
        return produtoNovo;
    }

    async buscarTodosProdutos(req) {
        const produtos = await this.repository.buscarTodosProdutos(req);
        return produtos;
    }

    async buscarProdutoPorID(id) {
        try {
            const produto = await this.repository.buscarProdutoPorID(id);
            if (!produto) {
                throw new CustomError("Produto não encontrado", HttpStatusCodes.NOT_FOUND);
            }
            return produto;
        } catch (error) {
            throw error;
        }
    }

    async atualizarProduto(id, dadosProduto) {
        const produtoAtualizado = await this.repository.atualizarProduto(id, dadosProduto);
        return produtoAtualizado;
    }

    async deletarProduto(id) {
        const produtoDeletado = await this.repository.deletarProduto(id)
        return produtoDeletado;
    }
}

export default ProdutoService;
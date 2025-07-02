import express from 'express';
import ProdutoController from '../controllers/ProdutoController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = express.Router();
const produtoController = new ProdutoController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Produto:
 *       type: object
 *       required:
 *         - nome_produto
 *         - preco
 *         - custo
 *         - categoria
 *         - estoque
 *         - estoque_min
 *         - id_fornecedor
 *         - codigo_produto
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do produto
 *         nome_produto:
 *           type: string
 *           description: Nome do produto
 *           example: "Notebook Dell Inspiron"
 *         descricao:
 *           type: string
 *           description: Descrição detalhada do produto
 *           example: "Notebook para uso profissional com 8GB RAM"
 *         preco:
 *           type: number
 *           description: Preço de venda do produto
 *           example: 2500.99
 *         marca:
 *           type: string
 *           description: Marca do produto
 *           example: "Dell"
 *         custo:
 *           type: number
 *           description: Custo de aquisição do produto
 *           example: 2000.00
 *         categoria:
 *           type: string
 *           description: Categoria do produto
 *           example: "Eletrônicos"
 *         estoque:
 *           type: number
 *           description: Quantidade em estoque
 *           example: 15
 *         estoque_min:
 *           type: number
 *           description: Estoque mínimo para alerta
 *           example: 5
 *         data_ultima_entrada:
 *           type: string
 *           format: date-time
 *           description: Data da última entrada no estoque
 *         status:
 *           type: boolean
 *           description: Status ativo/inativo do produto
 *           default: true
 *         id_fornecedor:
 *           type: number
 *           description: ID do fornecedor
 *           example: 1
 *         codigo_produto:
 *           type: string
 *           description: Código único do produto
 *           example: "DELL-NB-001"
 *         data_cadastro:
 *           type: string
 *           format: date-time
 *           description: Data de cadastro do produto
 *         data_ultima_atualizacao:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     
 *     ProdutoInput:
 *       type: object
 *       required:
 *         - nome_produto
 *         - preco
 *         - custo
 *         - categoria
 *         - estoque
 *         - estoque_min
 *         - id_fornecedor
 *         - codigo_produto
 *       properties:
 *         nome_produto:
 *           type: string
 *           description: Nome do produto
 *           example: "Notebook Dell Inspiron"
 *         descricao:
 *           type: string
 *           description: Descrição detalhada do produto
 *           example: "Notebook para uso profissional com 8GB RAM"
 *         preco:
 *           type: number
 *           description: Preço de venda do produto
 *           example: 2500.99
 *         marca:
 *           type: string
 *           description: Marca do produto
 *           example: "Dell"
 *         custo:
 *           type: number
 *           description: Custo de aquisição do produto
 *           example: 2000.00
 *         categoria:
 *           type: string
 *           description: Categoria do produto
 *           example: "Eletrônicos"
 *         estoque:
 *           type: number
 *           description: Quantidade em estoque
 *           example: 15
 *         estoque_min:
 *           type: number
 *           description: Estoque mínimo para alerta
 *           example: 5
 *         id_fornecedor:
 *           type: number
 *           description: ID do fornecedor
 *           example: 1
 *         codigo_produto:
 *           type: string
 *           description: Código único do produto
 *           example: "DELL-NB-001"
 */

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     summary: Listar todos os produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 docs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produto'
 *                 totalDocs:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router
    // Rotas gerais primeiro
    .get(
        "/",
        LogMiddleware.log('CONSULTA_PRODUTOS'),
        asyncWrapper(produtoController.listarProdutos.bind(produtoController))
    )
    
/**
 * @swagger
 * /api/produtos:
 *   post:
 *     summary: Cadastrar novo produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoInput'
 *     responses:
 *       201:
 *         description: Produto cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       409:
 *         description: Produto já existe
 *       500:
 *         description: Erro interno do servidor
 */
    .post(
        "/",
        LogMiddleware.log('CADASTRO_PRODUTO'),
        asyncWrapper(produtoController.cadastrarProduto.bind(produtoController))
    )
    
/**
 * @swagger
 * /api/produtos/estoque-baixo:
 *   get:
 *     summary: Listar produtos com estoque baixo
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos com estoque baixo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "/estoque-baixo",
        LogMiddleware.log('CONSULTA_ESTOQUE_BAIXO'),
        asyncWrapper(produtoController.listarEstoqueBaixo.bind(produtoController))
    )
    
/**
 * @swagger
 * /api/produtos/busca:
 *   get:
 *     summary: Buscar produtos por critérios
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Nome do produto para busca
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Categoria do produto
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         description: Marca do produto
 *       - in: query
 *         name: codigo
 *         schema:
 *           type: string
 *         description: Código do produto
 *     responses:
 *       200:
 *         description: Produtos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
    .get(
        "/busca",
        LogMiddleware.log('BUSCA_PRODUTOS'),
        asyncWrapper(produtoController.buscarProdutos.bind(produtoController))
    )
    
/**
 * @swagger
 * /api/produtos/desativar/{id}:
 *   patch:
 *     summary: Desativar produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto desativado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .patch(
        "/desativar/:id",
        LogMiddleware.log('DESATIVACAO_PRODUTO'),
        asyncWrapper(produtoController.desativarProduto.bind(produtoController))
    )
    
/**
 * @swagger
 * /api/produtos/reativar/{id}:
 *   patch:
 *     summary: Reativar produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto reativado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .patch(
        "/reativar/:id",
        LogMiddleware.log('REATIVACAO_PRODUTO'),
        asyncWrapper(produtoController.reativarProduto.bind(produtoController))
    )
    
/**
 * @swagger
 * /api/produtos/{id}:
 *   get:
 *     summary: Buscar produto por ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Rotas com parâmetros por último
    .get(
        "/:id",
        LogMiddleware.log('CONSULTA_PRODUTO'),
        asyncWrapper(produtoController.buscarProdutoPorID.bind(produtoController))
    )
    
/**
 * @swagger
 * /api/produtos/{id}:
 *   patch:
 *     summary: Atualizar produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoInput'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .patch(
        "/:id",
        LogMiddleware.log('ATUALIZACAO_PRODUTO'),
        asyncWrapper(produtoController.atualizarProduto.bind(produtoController))
    )
    
/**
 * @swagger
 * /api/produtos/{id}:
 *   delete:
 *     summary: Deletar produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .delete(
        "/:id",
        LogMiddleware.log('EXCLUSAO_PRODUTO'),
        asyncWrapper(produtoController.deletarProduto.bind(produtoController))
    );



export default router;
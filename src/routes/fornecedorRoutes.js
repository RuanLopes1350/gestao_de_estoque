import express from "express";
import { asyncWrapper } from "../utils/helpers/index.js";
import FornecedorController from "../controllers/FornecedorController.js";
import LogMiddleware from "../middlewares/LogMiddleware.js";

const router = express.Router();
const fornecedorController = new FornecedorController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Fornecedor:
 *       type: object
 *       required:
 *         - nome
 *         - cnpj
 *         - contato
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do fornecedor
 *         nome:
 *           type: string
 *           description: Nome da empresa fornecedora
 *           example: "Fornecedor ABC Ltda"
 *         cnpj:
 *           type: string
 *           description: CNPJ do fornecedor
 *           example: "12.345.678/0001-90"
 *         contato:
 *           type: string
 *           description: Informações de contato
 *           example: "contato@fornecedorabc.com.br"
 *         telefone:
 *           type: string
 *           description: Telefone do fornecedor
 *           example: "(11) 3333-4444"
 *         endereco:
 *           type: string
 *           description: Endereço completo
 *           example: "Rua das Empresas, 123 - São Paulo/SP"
 *         categoria:
 *           type: string
 *           description: Categoria de produtos fornecidos
 *           example: "Eletrônicos"
 *         status:
 *           type: boolean
 *           description: Status ativo/inativo do fornecedor
 *           default: true
 *         data_cadastro:
 *           type: string
 *           format: date-time
 *           description: Data de cadastro do fornecedor
 *         data_ultima_atualizacao:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     
 *     FornecedorInput:
 *       type: object
 *       required:
 *         - nome
 *         - cnpj
 *         - contato
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da empresa fornecedora
 *           example: "Fornecedor ABC Ltda"
 *         cnpj:
 *           type: string
 *           description: CNPJ do fornecedor
 *           example: "12.345.678/0001-90"
 *         contato:
 *           type: string
 *           description: Informações de contato
 *           example: "contato@fornecedorabc.com.br"
 *         telefone:
 *           type: string
 *           description: Telefone do fornecedor
 *           example: "(11) 3333-4444"
 *         endereco:
 *           type: string
 *           description: Endereço completo
 *           example: "Rua das Empresas, 123 - São Paulo/SP"
 *         categoria:
 *           type: string
 *           description: Categoria de produtos fornecidos
 *           example: "Eletrônicos"
 */

/**
 * @swagger
 * /api/fornecedores:
 *   get:
 *     summary: Listar todos os fornecedores
 *     tags: [Fornecedores]
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
 *         description: Lista de fornecedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fornecedor'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router
  .get(
    "/",
    LogMiddleware.log("CONSULTA_FORNECEDORES"),
    asyncWrapper(fornecedorController.listar.bind(fornecedorController))
  )
  
/**
 * @swagger
 * /api/fornecedores/{id}:
 *   get:
 *     summary: Buscar fornecedor por ID
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fornecedor'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
  .get(
    "/:id",
    LogMiddleware.log("CONSULTA_FORNECEDOR"),
    asyncWrapper(fornecedorController.buscarPorId.bind(fornecedorController))
  )
  
/**
 * @swagger
 * /api/fornecedores:
 *   post:
 *     summary: Cadastrar novo fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FornecedorInput'
 *     responses:
 *       201:
 *         description: Fornecedor cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fornecedor'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       409:
 *         description: Fornecedor já existe
 *       500:
 *         description: Erro interno do servidor
 */
  .post(
    "/",
    LogMiddleware.log("CADASTRO_FORNECEDOR"),
    asyncWrapper(fornecedorController.criar.bind(fornecedorController))
  )
  
/**
 * @swagger
 * /api/fornecedores/{id}:
 *   put:
 *     summary: Atualizar fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do fornecedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FornecedorInput'
 *     responses:
 *       200:
 *         description: Fornecedor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fornecedor'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
  .put(
    "/:id",
    LogMiddleware.log("ATUALIZACAO_FORNECEDOR"),
    asyncWrapper(fornecedorController.atualizar.bind(fornecedorController))
  )
  
/**
 * @swagger
 * /api/fornecedores/{id}:
 *   delete:
 *     summary: Deletar fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor deletado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
  .delete(
    "/:id",
    LogMiddleware.log("EXCLUSAO_FORNECEDOR"),
    asyncWrapper(fornecedorController.deletar.bind(fornecedorController))
  )
  
/**
 * @swagger
 * /api/fornecedores/desativar/{id}:
 *   patch:
 *     summary: Desativar fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor desativado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
  .patch(
    "/desativar/:id",
    LogMiddleware.log("DESATIVACAO_FORNECEDOR"),
    asyncWrapper(
      fornecedorController.desativarFornecedor.bind(fornecedorController)
    )
  )
  
/**
 * @swagger
 * /api/fornecedores/reativar/{id}:
 *   patch:
 *     summary: Reativar fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor reativado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
  .patch(
    "/reativar/:id",
    LogMiddleware.log("REATIVACAO_FORNECEDOR"),
    asyncWrapper(
      fornecedorController.reativarFornecedor.bind(fornecedorController)
    )
  );

export default router;

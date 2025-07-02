import express from 'express';
import GrupoController from '../controllers/GrupoController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = express.Router();
const grupoController = new GrupoController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Grupo:
 *       type: object
 *       required:
 *         - nome
 *         - descricao
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do grupo
 *         nome:
 *           type: string
 *           description: Nome do grupo
 *           example: "Administradores"
 *         descricao:
 *           type: string
 *           description: Descrição do grupo
 *           example: "Grupo com acesso total ao sistema"
 *         permissoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de permissões do grupo
 *           example: ["ADMIN_USUARIOS", "ADMIN_PRODUTOS", "ADMIN_FORNECEDORES"]
 *         status:
 *           type: boolean
 *           description: Status ativo/inativo do grupo
 *           default: true
 *         data_cadastro:
 *           type: string
 *           format: date-time
 *           description: Data de cadastro do grupo
 *         data_ultima_atualizacao:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     
 *     GrupoInput:
 *       type: object
 *       required:
 *         - nome
 *         - descricao
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do grupo
 *           example: "Administradores"
 *         descricao:
 *           type: string
 *           description: Descrição do grupo
 *           example: "Grupo com acesso total ao sistema"
 *         permissoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de permissões do grupo
 *           example: ["ADMIN_USUARIOS", "ADMIN_PRODUTOS", "ADMIN_FORNECEDORES"]
 *     
 *     PermissaoGrupoRequest:
 *       type: object
 *       required:
 *         - permissao
 *       properties:
 *         permissao:
 *           type: string
 *           description: Nome da permissão
 *           example: "ADMIN_PRODUTOS"
 */

/**
 * @swagger
 * /api/grupos:
 *   get:
 *     summary: Listar todos os grupos
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grupo'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router
    // Listar grupos
    .get(
        "/",
        authMiddleware,
        LogMiddleware.log('CONSULTA_GRUPOS'),
        asyncWrapper(grupoController.listar.bind(grupoController))
    )
    
/**
 * @swagger
 * /api/grupos:
 *   post:
 *     summary: Criar novo grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrupoInput'
 *     responses:
 *       201:
 *         description: Grupo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       409:
 *         description: Grupo já existe
 *       500:
 *         description: Erro interno do servidor
 */
    // Criar grupo
    .post(
        "/",
        authMiddleware,
        LogMiddleware.log('CRIACAO_GRUPO'),
        asyncWrapper(grupoController.criar.bind(grupoController))
    )
    
/**
 * @swagger
 * /api/grupos/{id}:
 *   get:
 *     summary: Buscar grupo por ID
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo
 *     responses:
 *       200:
 *         description: Grupo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Buscar grupo por ID
    .get(
        "/:id",
        authMiddleware,
        LogMiddleware.log('CONSULTA_GRUPO'),
        asyncWrapper(grupoController.buscarPorId.bind(grupoController))
    )
    
/**
 * @swagger
 * /api/grupos/{id}:
 *   patch:
 *     summary: Atualizar grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrupoInput'
 *     responses:
 *       200:
 *         description: Grupo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Atualizar grupo
    .patch(
        "/:id",
        authMiddleware,
        LogMiddleware.log('ATUALIZACAO_GRUPO'),
        asyncWrapper(grupoController.atualizar.bind(grupoController))
    )
    
/**
 * @swagger
 * /api/grupos/{id}:
 *   delete:
 *     summary: Deletar grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo
 *     responses:
 *       200:
 *         description: Grupo deletado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Deletar grupo
    .delete(
        "/:id",
        authMiddleware,
        LogMiddleware.log('EXCLUSAO_GRUPO'),
        asyncWrapper(grupoController.deletar.bind(grupoController))
    )
    
/**
 * @swagger
 * /api/grupos/{id}/ativar:
 *   patch:
 *     summary: Ativar grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo
 *     responses:
 *       200:
 *         description: Grupo ativado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Ativar grupo
    .patch(
        "/:id/ativar",
        authMiddleware,
        LogMiddleware.log('ATIVACAO_GRUPO'),
        asyncWrapper(grupoController.ativar.bind(grupoController))
    )
    
/**
 * @swagger
 * /api/grupos/{id}/desativar:
 *   patch:
 *     summary: Desativar grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo
 *     responses:
 *       200:
 *         description: Grupo desativado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Desativar grupo
    .patch(
        "/:id/desativar",
        authMiddleware,
        LogMiddleware.log('DESATIVACAO_GRUPO'),
        asyncWrapper(grupoController.desativar.bind(grupoController))
    )
    
/**
 * @swagger
 * /api/grupos/{id}/permissoes:
 *   post:
 *     summary: Adicionar permissão ao grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissaoGrupoRequest'
 *     responses:
 *       200:
 *         description: Permissão adicionada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Adicionar permissão ao grupo
    .post(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('ADICAO_PERMISSAO_GRUPO'),
        asyncWrapper(grupoController.adicionarPermissao.bind(grupoController))
    )
    
/**
 * @swagger
 * /api/grupos/{id}/permissoes:
 *   delete:
 *     summary: Remover permissão do grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissaoGrupoRequest'
 *     responses:
 *       200:
 *         description: Permissão removida com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Remover permissão do grupo
    .delete(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('REMOCAO_PERMISSAO_GRUPO'),
        asyncWrapper(grupoController.removerPermissao.bind(grupoController))
    );

export default router;

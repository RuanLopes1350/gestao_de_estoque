import express from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = express.Router();
const usuarioController = new UsuarioController(); 

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nome
 *         - matricula
 *         - senha
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do usuário
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *           example: "João Silva"
 *         matricula:
 *           type: string
 *           description: Matrícula única do usuário
 *           example: "12345"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *           example: "joao.silva@empresa.com"
 *         telefone:
 *           type: string
 *           description: Telefone do usuário
 *           example: "(11) 99999-9999"
 *         cargo:
 *           type: string
 *           description: Cargo do usuário
 *           example: "Gerente de Estoque"
 *         departamento:
 *           type: string
 *           description: Departamento do usuário
 *           example: "Logística"
 *         status:
 *           type: boolean
 *           description: Status ativo/inativo do usuário
 *           default: true
 *         grupos:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs dos grupos do usuário
 *         permissoes:
 *           type: array
 *           items:
 *             type: string
 *           description: Permissões específicas do usuário
 *         data_cadastro:
 *           type: string
 *           format: date-time
 *           description: Data de cadastro do usuário
 *         data_ultima_atualizacao:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     
 *     UsuarioInput:
 *       type: object
 *       required:
 *         - nome
 *         - matricula
 *         - email
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *           example: "João Silva"
 *         matricula:
 *           type: string
 *           description: Matrícula única do usuário
 *           example: "12345"
 *         senha:
 *           type: string
 *           format: password
 *           description: Senha do usuário (opcional - se não informada, usuário deve definir no primeiro login)
 *           example: "minhasenha123"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *           example: "joao.silva@empresa.com"
 *         telefone:
 *           type: string
 *           description: Telefone do usuário
 *           example: "(11) 99999-9999"
 *         cargo:
 *           type: string
 *           description: Cargo do usuário
 *           example: "Gerente de Estoque"
 *         departamento:
 *           type: string
 *           description: Departamento do usuário
 *           example: "Logística"
 *     
 *     GrupoUsuarioRequest:
 *       type: object
 *       required:
 *         - usuarioId
 *         - grupoId
 *       properties:
 *         usuarioId:
 *           type: string
 *           description: ID do usuário
 *         grupoId:
 *           type: string
 *           description: ID do grupo
 *     
 *     PermissaoUsuarioRequest:
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
 * /api/usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
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
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router
    // Rotas gerais primeiro
    .get(
        "/",
        LogMiddleware.log('CONSULTA_USUARIOS'),
        asyncWrapper(usuarioController.listarUsuarios.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cadastrar novo usuário (com ou sem senha)
 *     description: |
 *       Cadastra um novo usuário no sistema. A senha é opcional:
 *       - **Com senha**: Usuário fica ativo e pode fazer login imediatamente
 *       - **Sem senha**: Usuário fica inativo e recebe código para definir senha no primeiro login
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Usuario'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Usuário cadastrado com sucesso. Código de segurança gerado: 123456"
 *                     instrucoes:
 *                       type: string
 *                       example: "O usuário deve usar este código na endpoint '/auth/redefinir-senha/codigo' para definir sua senha."
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       409:
 *         description: Usuário já existe
 *       500:
 *         description: Erro interno do servidor
 */
    .post(
        "/", 
        LogMiddleware.log('CADASTRO_USUARIO'),
        asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/cadastrar-sem-senha:
 *   post:
 *     summary: Cadastrar usuário sem senha (gera código de segurança)
 *     description: Permite ao administrador cadastrar um usuário sem definir senha. Um código de segurança será gerado para que o usuário defina sua própria senha.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome_usuario
 *               - email
 *               - matricula
 *             properties:
 *               nome_usuario:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "joao.silva@empresa.com"
 *               matricula:
 *                 type: string
 *                 description: Matrícula do usuário
 *                 example: "12345"
 *               perfil:
 *                 type: string
 *                 enum: [administrador, gerente, estoquista]
 *                 description: Perfil do usuário
 *                 example: "estoquista"
 *               grupos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs dos grupos do usuário
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso, código de segurança gerado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário cadastrado com sucesso. Código de segurança gerado: 123456"
 *                 instrucoes:
 *                   type: string
 *                   example: "O usuário deve usar este código na endpoint '/auth/redefinir-senha/codigo' para definir sua senha."
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       409:
 *         description: Usuário já existe
 *       500:
 *         description: Erro interno do servidor
 */
router
/**
 * @swagger
 * /api/usuarios/busca:
 *   get:
 *     summary: Buscar usuário por matrícula
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: matricula
 *         required: true
 *         schema:
 *           type: string
 *         description: Matrícula do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "busca",
        LogMiddleware.log('BUSCA_USUARIO_MATRICULA'),
        asyncWrapper(usuarioController.buscarUsuarioPorMatricula.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/{matricula}:
 *   get:
 *     summary: Buscar usuário por ID/matrícula
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matricula
 *         required: true
 *         schema:
 *           type: string
 *         description: Matrícula do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Rotas com parâmetros por último
    .get(
        "/:matricula",
        LogMiddleware.log('CONSULTA_USUARIO'),
        asyncWrapper(usuarioController.buscarUsuarioPorID.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/desativar/{id}:
 *   patch:
 *     summary: Desativar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário desativado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    //Rota para desativar/ativar usuario por id
    .patch(
        "/desativar/:id",
        LogMiddleware.log('DESATIVACAO_USUARIO'),
        asyncWrapper(usuarioController.desativarUsuario.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/reativar/{id}:
 *   patch:
 *     summary: Reativar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário reativado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .patch(
        "/reativar/:id",
        LogMiddleware.log('REATIVACAO_USUARIO'),
        asyncWrapper(usuarioController.reativarUsuario.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/{matricula}:
 *   patch:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matricula
 *         required: true
 *         schema:
 *           type: string
 *         description: Matrícula do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .patch(
        "/:matricula",
        LogMiddleware.log('ATUALIZACAO_USUARIO'),
        asyncWrapper(usuarioController.atualizarUsuario.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/{matricula}:
 *   delete:
 *     summary: Deletar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matricula
 *         required: true
 *         schema:
 *           type: string
 *         description: Matrícula do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .delete(
        "/:matricula",
        LogMiddleware.log('EXCLUSAO_USUARIO'),
        asyncWrapper(usuarioController.deletarUsuario.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/grupos/adicionar:
 *   post:
 *     summary: Adicionar usuário a um grupo
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrupoUsuarioRequest'
 *     responses:
 *       200:
 *         description: Usuário adicionado ao grupo com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário ou grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Gerenciamento de grupos de usuários
    .post(
        "/grupos/adicionar",
        authMiddleware,
        LogMiddleware.log('ADICAO_USUARIO_GRUPO'),
        asyncWrapper(usuarioController.adicionarUsuarioAoGrupo.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/grupos/remover:
 *   post:
 *     summary: Remover usuário de um grupo
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrupoUsuarioRequest'
 *     responses:
 *       200:
 *         description: Usuário removido do grupo com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário ou grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .post(
        "/grupos/remover",
        authMiddleware,
        LogMiddleware.log('REMOCAO_USUARIO_GRUPO'),
        asyncWrapper(usuarioController.removerUsuarioDoGrupo.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/{id}/permissoes:
 *   post:
 *     summary: Adicionar permissão ao usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissaoUsuarioRequest'
 *     responses:
 *       200:
 *         description: Permissão adicionada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Gerenciamento de permissões individuais
    .post(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('ADICAO_PERMISSAO_USUARIO'),
        asyncWrapper(usuarioController.adicionarPermissaoAoUsuario.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/{id}/permissoes:
 *   delete:
 *     summary: Remover permissão do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissaoUsuarioRequest'
 *     responses:
 *       200:
 *         description: Permissão removida com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    .delete(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('REMOCAO_PERMISSAO_USUARIO'),
        asyncWrapper(usuarioController.removerPermissaoDoUsuario.bind(usuarioController))
    )
    
/**
 * @swagger
 * /api/usuarios/{id}/permissoes:
 *   get:
 *     summary: Obter permissões do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de permissões do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permissoes:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Consulta de permissões
    .get(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('CONSULTA_PERMISSOES_USUARIO'),
        asyncWrapper(usuarioController.obterPermissoesUsuario.bind(usuarioController))
    );

export default router;
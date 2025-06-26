import express from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - matricula
 *         - senha
 *       properties:
 *         matricula:
 *           type: string
 *           description: Matrícula do usuário
 *           example: "12345"
 *         senha:
 *           type: string
 *           format: password
 *           description: Senha do usuário
 *           example: "minhasenha123"
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token JWT de acesso
 *         refreshToken:
 *           type: string
 *           description: Token de refresh
 *         usuario:
 *           type: object
 *           description: Dados do usuário logado
 *     
 *     RefreshRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Token de refresh válido
 *     
 *     RecuperarSenhaRequest:
 *       type: object
 *       required:
 *         - matricula
 *       properties:
 *         matricula:
 *           type: string
 *           description: Matrícula do usuário
 *           example: "12345"
 *     
 *     RedefinirSenhaTokenRequest:
 *       type: object
 *       required:
 *         - token
 *         - novaSenha
 *       properties:
 *         token:
 *           type: string
 *           description: Token de recuperação de senha
 *         novaSenha:
 *           type: string
 *           format: password
 *           description: Nova senha do usuário
 *     
 *     RedefinirSenhaCodigoRequest:
 *       type: object
 *       required:
 *         - matricula
 *         - codigo
 *         - novaSenha
 *       properties:
 *         matricula:
 *           type: string
 *           description: Matrícula do usuário
 *         codigo:
 *           type: string
 *           description: Código de verificação recebido
 *         novaSenha:
 *           type: string
 *           format: password
 *           description: Nova senha do usuário
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realizar login no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
// Rotas públicas
router.post('/login', (req, res) => AuthController.login(req, res));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Novo token JWT
 *       400:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/refresh', (req, res) => AuthController.refresh(req, res));

/**
 * @swagger
 * /auth/recuperar-senha:
 *   post:
 *     summary: Solicitar recuperação de senha
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecuperarSenhaRequest'
 *     responses:
 *       200:
 *         description: Solicitação de recuperação enviada
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/recuperar-senha', AuthController.solicitarRecuperacaoSenha.bind(AuthController));

/**
 * @swagger
 * /auth/redefinir-senha/token:
 *   post:
 *     summary: Redefinir senha usando token
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RedefinirSenhaTokenRequest'
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/redefinir-senha/token', AuthController.redefinirSenhaComToken.bind(AuthController));

/**
 * @swagger
 * /auth/redefinir-senha/codigo:
 *   post:
 *     summary: Redefinir senha usando código
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RedefinirSenhaCodigoRequest'
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Código inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/redefinir-senha/codigo', AuthController.redefinirSenhaComCodigo.bind(AuthController));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Realizar logout do sistema
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
// Rotas protegidas
router.post('/logout', authMiddleware, (req, res) => AuthController.logout(req, res));

/**
 * @swagger
 * /auth/revoke:
 *   post:
 *     summary: Revogar token de acesso
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token revogado com sucesso
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/revoke', authMiddleware, (req, res) => AuthController.revoke(req, res));

export default router;
import express from 'express';
import LogController from '../controllers/LogController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const router = express.Router();
const logController = new LogController();

// Todas as rotas de logs precisam de autenticação
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do log
 *         usuario_id:
 *           type: string
 *           description: ID do usuário que executou a ação
 *         evento:
 *           type: string
 *           description: Tipo de evento registrado
 *           example: "LOGIN_USUARIO"
 *         detalhes:
 *           type: object
 *           description: Detalhes específicos do evento
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Data e hora do evento
 *         ip:
 *           type: string
 *           description: Endereço IP de origem
 *           example: "192.168.1.100"
 *         user_agent:
 *           type: string
 *           description: User agent do navegador
 *         status:
 *           type: string
 *           enum: [SUCESSO, ERRO, AVISO]
 *           description: Status do evento
 *         nivel:
 *           type: string
 *           enum: [INFO, WARNING, ERROR, CRITICAL]
 *           description: Nível de importância do log
 *     
 *     UsuarioOnline:
 *       type: object
 *       properties:
 *         usuario_id:
 *           type: string
 *           description: ID do usuário
 *         nome:
 *           type: string
 *           description: Nome do usuário
 *         ultimo_acesso:
 *           type: string
 *           format: date-time
 *           description: Último acesso registrado
 *         status:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *           description: Status atual do usuário
 *     
 *     EstatisticasLog:
 *       type: object
 *       properties:
 *         total_eventos:
 *           type: integer
 *           description: Total de eventos registrados
 *         eventos_por_tipo:
 *           type: object
 *           description: Contagem de eventos por tipo
 *         usuarios_ativos:
 *           type: integer
 *           description: Número de usuários ativos
 *         periodo:
 *           type: object
 *           properties:
 *             inicio:
 *               type: string
 *               format: date-time
 *             fim:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/logs/online-users:
 *   get:
 *     summary: Obter usuários online (apenas administradores)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários online
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UsuarioOnline'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router
    // Usuários online (apenas administradores)
    .get(
        "/online-users",
        asyncWrapper(logController.getOnlineUsers.bind(logController))
    )
    
/**
 * @swagger
 * /api/logs/usuario/{userId}:
 *   get:
 *     summary: Obter logs de um usuário específico
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
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
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período
 *     responses:
 *       200:
 *         description: Logs do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Log'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
    // Obter logs de um usuário específico
    .get(
        "/usuario/:userId",
        asyncWrapper(logController.getUserLogs.bind(logController))
    )
    
/**
 * @swagger
 * /api/logs/search:
 *   get:
 *     summary: Buscar eventos específicos (apenas administradores)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: evento
 *         schema:
 *           type: string
 *         description: Tipo de evento para buscar
 *         example: "LOGIN_USUARIO"
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCESSO, ERRO, AVISO]
 *         description: Status do evento
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: string
 *           enum: [INFO, WARNING, ERROR, CRITICAL]
 *         description: Nível do log
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período
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
 *         description: Eventos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Log'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
    // Buscar eventos específicos (apenas administradores)
    .get(
        "/search",
        asyncWrapper(logController.searchEvents.bind(logController))
    )
    
/**
 * @swagger
 * /api/logs/statistics:
 *   get:
 *     summary: Obter estatísticas de logs (apenas administradores)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período
 *       - in: query
 *         name: agrupamento
 *         schema:
 *           type: string
 *           enum: [dia, semana, mes]
 *           default: dia
 *         description: Tipo de agrupamento para as estatísticas
 *     responses:
 *       200:
 *         description: Estatísticas de logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstatisticasLog'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
    // Obter estatísticas de logs (apenas administradores)
    .get(
        "/statistics",
        asyncWrapper(logController.getLogStatistics.bind(logController))
    )
    
/**
 * @swagger
 * /api/logs/critical:
 *   get:
 *     summary: Obter eventos críticos (apenas administradores)
 *     tags: [Logs]
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
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período
 *     responses:
 *       200:
 *         description: Eventos críticos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Log'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
    // Obter eventos críticos (apenas administradores)
    .get(
        "/critical",
        asyncWrapper(logController.getCriticalEvents.bind(logController))
    );

export default router;

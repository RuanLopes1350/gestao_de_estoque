import { Router } from 'express';
import MovimentacoesController from '../controllers/MovimentacoesController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = Router();
const movimentacoesController = new MovimentacoesController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Movimentacao:
 *       type: object
 *       required:
 *         - produto_id
 *         - tipo_movimentacao
 *         - quantidade
 *         - usuario_id
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da movimentação
 *         produto_id:
 *           type: string
 *           description: ID do produto movimentado
 *         tipo_movimentacao:
 *           type: string
 *           enum: [ENTRADA, SAIDA, AJUSTE, TRANSFERENCIA]
 *           description: Tipo da movimentação
 *           example: "ENTRADA"
 *         quantidade:
 *           type: number
 *           description: Quantidade movimentada
 *           example: 10
 *         valor_unitario:
 *           type: number
 *           description: Valor unitário do produto na movimentação
 *           example: 25.50
 *         valor_total:
 *           type: number
 *           description: Valor total da movimentação
 *           example: 255.00
 *         motivo:
 *           type: string
 *           description: Motivo da movimentação
 *           example: "Compra de estoque"
 *         observacoes:
 *           type: string
 *           description: Observações adicionais
 *           example: "Produto recebido em perfeito estado"
 *         usuario_id:
 *           type: string
 *           description: ID do usuário responsável
 *         data_movimentacao:
 *           type: string
 *           format: date-time
 *           description: Data e hora da movimentação
 *         documento_referencia:
 *           type: string
 *           description: Número do documento de referência
 *           example: "NF-12345"
 *         status:
 *           type: string
 *           enum: [PENDENTE, CONFIRMADA, CANCELADA]
 *           description: Status da movimentação
 *           default: "PENDENTE"
 *         data_cadastro:
 *           type: string
 *           format: date-time
 *           description: Data de cadastro
 *         data_ultima_atualizacao:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     
 *     MovimentacaoInput:
 *       type: object
 *       required:
 *         - produto_id
 *         - tipo_movimentacao
 *         - quantidade
 *         - usuario_id
 *       properties:
 *         produto_id:
 *           type: string
 *           description: ID do produto movimentado
 *         tipo_movimentacao:
 *           type: string
 *           enum: [ENTRADA, SAIDA, AJUSTE, TRANSFERENCIA]
 *           description: Tipo da movimentação
 *           example: "ENTRADA"
 *         quantidade:
 *           type: number
 *           description: Quantidade movimentada
 *           example: 10
 *         valor_unitario:
 *           type: number
 *           description: Valor unitário do produto na movimentação
 *           example: 25.50
 *         motivo:
 *           type: string
 *           description: Motivo da movimentação
 *           example: "Compra de estoque"
 *         observacoes:
 *           type: string
 *           description: Observações adicionais
 *           example: "Produto recebido em perfeito estado"
 *         usuario_id:
 *           type: string
 *           description: ID do usuário responsável
 *         data_movimentacao:
 *           type: string
 *           format: date-time
 *           description: Data e hora da movimentação
 *         documento_referencia:
 *           type: string
 *           description: Número do documento de referência
 *           example: "NF-12345"
 */

/**
 * @swagger
 * /api/movimentacoes:
 *   get:
 *     summary: Listar todas as movimentações
 *     tags: [Movimentações]
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
 *         description: Lista de movimentações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movimentacao'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router
    // Rotas sem parâmetros de rota primeiro
    .get(
        '/',
        LogMiddleware.log('CONSULTA_MOVIMENTACOES'),
        asyncWrapper(movimentacoesController.listarMovimentacoes.bind(movimentacoesController))
    )
    
/**
 * @swagger
 * /api/movimentacoes:
 *   post:
 *     summary: Cadastrar nova movimentação
 *     tags: [Movimentações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimentacaoInput'
 *     responses:
 *       201:
 *         description: Movimentação cadastrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movimentacao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
    .post(
        '/',
        LogMiddleware.log('CADASTRO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.cadastrarMovimentacao.bind(movimentacoesController))
    )
    
/**
 * @swagger
 * /api/movimentacoes/busca:
 *   get:
 *     summary: Buscar movimentações por critérios
 *     tags: [Movimentações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: produto_id
 *         schema:
 *           type: string
 *         description: ID do produto
 *       - in: query
 *         name: tipo_movimentacao
 *         schema:
 *           type: string
 *           enum: [ENTRADA, SAIDA, AJUSTE, TRANSFERENCIA]
 *         description: Tipo da movimentação
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: string
 *         description: ID do usuário
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
 *         description: Movimentações encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movimentacao'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
    // Rotas com query strings (busca e filtro)
    .get(
        '/busca',
        LogMiddleware.log('BUSCA_MOVIMENTACOES'),
        asyncWrapper(movimentacoesController.buscarMovimentacoes.bind(movimentacoesController))
    )
    
/**
 * @swagger
 * /api/movimentacoes/filtro:
 *   get:
 *     summary: Filtrar movimentações com critérios avançados
 *     tags: [Movimentações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: produto_id
 *         schema:
 *           type: string
 *         description: ID do produto
 *       - in: query
 *         name: tipo_movimentacao
 *         schema:
 *           type: string
 *           enum: [ENTRADA, SAIDA, AJUSTE, TRANSFERENCIA]
 *         description: Tipo da movimentação
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDENTE, CONFIRMADA, CANCELADA]
 *         description: Status da movimentação
 *       - in: query
 *         name: valor_min
 *         schema:
 *           type: number
 *         description: Valor mínimo
 *       - in: query
 *         name: valor_max
 *         schema:
 *           type: number
 *         description: Valor máximo
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
 *         description: Movimentações filtradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movimentacao'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
    .get(
        '/filtro',
        LogMiddleware.log('FILTRO_MOVIMENTACOES'),
        asyncWrapper(movimentacoesController.filtrarMovimentacoesAvancado.bind(movimentacoesController))
    )
    
/**
 * @swagger
 * /api/movimentacoes/{id}:
 *   get:
 *     summary: Buscar movimentação por ID
 *     tags: [Movimentações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da movimentação
 *     responses:
 *       200:
 *         description: Movimentação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movimentacao'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Movimentação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
    // Rotas com parâmetros de rota por último
    .get(
        '/:id',
        LogMiddleware.log('CONSULTA_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.buscarMovimentacaoPorID.bind(movimentacoesController))
    )
    
/**
 * @swagger
 * /api/movimentacoes/{id}:
 *   patch:
 *     summary: Atualizar movimentação
 *     tags: [Movimentações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da movimentação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimentacaoInput'
 *     responses:
 *       200:
 *         description: Movimentação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movimentacao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Movimentação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
    .patch(
        '/:id',
        LogMiddleware.log('ATUALIZACAO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.atualizarMovimentacao.bind(movimentacoesController))
    )
    
    /**
 * @swagger
 * /api/movimentacoes/desativar/{id}:
 *   patch:
 *     summary: Desativar movimentação
 *     tags: [Movimentações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da movimentação
 *     responses:
 *       200:
 *         description: Movimentação desativada com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Movimentação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
    .patch(
        '/desativar/:id',
        LogMiddleware.log('DESATIVACAO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.desativarMovimentacao.bind(movimentacoesController))
    )
    
    /**
 * @swagger
 * /api/movimentacoes/reativar/{id}:
 *   patch:
 *     summary: Reativar movimentação
 *     tags: [Movimentações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da movimentação
 *     responses:
 *       200:
 *         description: Movimentação reativada com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Movimentação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
    .patch(
        '/reativar/:id',
        LogMiddleware.log('REATIVACAO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.reativarMovimentacao.bind(movimentacoesController))
    );



export default router;
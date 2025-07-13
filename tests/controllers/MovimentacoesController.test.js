import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/services/movimentacaoService.js', () => {
    return jest.fn().mockImplementation(() => ({
        listarMovimentacoes: jest.fn(),
        buscarMovimentacaoPorID: jest.fn(),
        buscarMovimentacoesPorTipo: jest.fn(),
        buscarMovimentacoesPorPeriodo: jest.fn(),
        buscarMovimentacoesPorProduto: jest.fn(),
        buscarMovimentacoesPorUsuario: jest.fn(),
        cadastrarMovimentacao: jest.fn(),
        atualizarMovimentacao: jest.fn(),
        deletarMovimentacao: jest.fn()
    }));
});

jest.mock('../../src/utils/helpers/index.js', () => ({
    CommonResponse: {
        success: jest.fn(),
        error: jest.fn(),
        created: jest.fn(),
    },
    CustomError: class extends Error {
        constructor(options) {
            super(options.customMessage || 'Custom error');
            this.statusCode = options.statusCode;
            this.errorType = options.errorType;
            this.field = options.field;
            this.customMessage = options.customMessage;
        }
    },
    HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        NOT_FOUND: { code: 404 },
        OK: { code: 200 },
        CREATED: { code: 201 }
    },
}));

jest.mock('../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js', () => ({
    MovimentacaoIdSchema: {
        parse: jest.fn(),
    },
    MovimentacaoQuerySchema: {
        parseAsync: jest.fn(),
    }
}));

jest.mock('../../src/utils/validators/schemas/zod/MovimentacaoSchema.js', () => ({
    MovimentacaoSchema: {
        parseAsync: jest.fn(),
    },
    MovimentacaoUpdateSchema: {
        parseAsync: jest.fn(),
    }
}));

jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    default: {
        logAction: jest.fn(),
    }
}));

import MovimentacoesController from '../../src/controllers/MovimentacoesController.js';
import { CommonResponse } from '../../src/utils/helpers/index.js';
import { MovimentacaoIdSchema, MovimentacaoQuerySchema } from '../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js';

describe('MovimentacoesController', () => {
    let movimentacoesController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        movimentacoesController = new MovimentacoesController();
        
        mockReq = {
            body: {},
            params: {},
            query: {},
            userId: 'user123',
            userMatricula: 'MAT123'
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Reset dos mocks
        jest.clearAllMocks();
    });

    describe('validateId', () => {
        it('deve validar ID com sucesso', () => {
            MovimentacaoIdSchema.parse.mockReturnValue('123');

            expect(() => movimentacoesController.validateId('123')).not.toThrow();
            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith('123');
        });

        it('deve lançar erro quando ID não for fornecido', () => {
            expect(() => movimentacoesController.validateId(null)).toThrow();
        });
    });

    describe('listarMovimentacoes', () => {
        it('deve listar movimentações com sucesso', async () => {
            const mockMovimentacoes = {
                docs: [
                    { id: '1', tipo: 'entrada', quantidade: 10 },
                    { id: '2', tipo: 'saida', quantidade: 5 }
                ]
            };

            movimentacoesController.service.listarMovimentacoes.mockResolvedValue(mockMovimentacoes);
            CommonResponse.success.mockReturnValue('response');

            const result = await movimentacoesController.listarMovimentacoes(mockReq, mockRes);

            expect(movimentacoesController.service.listarMovimentacoes).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockMovimentacoes);
            expect(result).toBe('response');
        });

        it('deve retornar erro quando nenhuma movimentação for encontrada', async () => {
            const mockMovimentacoes = { docs: [] };

            movimentacoesController.service.listarMovimentacoes.mockResolvedValue(mockMovimentacoes);
            CommonResponse.error.mockReturnValue('error response');

            const result = await movimentacoesController.listarMovimentacoes(mockReq, mockRes);

            expect(movimentacoesController.service.listarMovimentacoes).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                "resourceNotFound",
                "Movimentacao",
                [],
                "Nenhuma movimentação encontrada com os critérios informados."
            );
            expect(result).toBe('error response');
        });
    });

    describe('buscarMovimentacaoPorID', () => {
        it('deve buscar movimentação por ID com sucesso', async () => {
            const mockMovimentacao = { id: '123', tipo: 'entrada', quantidade: 10 };
            mockReq.params = { id: '123' };
            
            MovimentacaoIdSchema.parse.mockReturnValue('123');
            movimentacoesController.service.buscarMovimentacaoPorID.mockResolvedValue(mockMovimentacao);
            CommonResponse.success.mockReturnValue('success response');

            const result = await movimentacoesController.buscarMovimentacaoPorID(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith('123');
            expect(movimentacoesController.service.buscarMovimentacaoPorID).toHaveBeenCalledWith('123');
            expect(result).toBe('success response');
        });
    });

    describe('buscarMovimentacoes', () => {
        it('deve buscar movimentações por tipo', async () => {
            const mockMovimentacoes = {
                docs: [{ id: '1', tipo: 'entrada', quantidade: 10 }]
            };
            mockReq.query = { tipo: 'entrada' };
            
            movimentacoesController.service.buscarMovimentacoesPorTipo.mockResolvedValue(mockMovimentacoes);
            CommonResponse.success.mockReturnValue('success response');

            const result = await movimentacoesController.buscarMovimentacoes(mockReq, mockRes);

            expect(movimentacoesController.service.buscarMovimentacoesPorTipo).toHaveBeenCalledWith('entrada', 1, 10);
            expect(result).toBe('success response');
        });
    });
});

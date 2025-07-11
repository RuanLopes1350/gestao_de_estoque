import MovimentacoesController from '../../src/controllers/MovimentacoesController.js';
import { jest } from '@jest/globals';

// Mock apenas do que precisamos
const mockMovimentacaoService = {
    listarMovimentacoes: jest.fn(),
    buscarMovimentacaoPorID: jest.fn(),
    buscarMovimentacoesPorTipo: jest.fn()
};

const mockCommonResponse = {
    success: jest.fn(),
    error: jest.fn(),
    created: jest.fn()
};

const mockMovimentacaoIdSchema = {
    parse: jest.fn()
};

const mockMovimentacaoQuerySchema = {
    parseAsync: jest.fn()
};

// Mock global simples
global.MovimentacaoService = function() {
    return mockMovimentacaoService;
};

global.CommonResponse = mockCommonResponse;
global.MovimentacaoIdSchema = mockMovimentacaoIdSchema;
global.MovimentacaoQuerySchema = mockMovimentacaoQuerySchema;

// Substitui as dependências do controller
MovimentacoesController.prototype.service = mockMovimentacaoService;

describe('MovimentacoesController', () => {
    let movimentacoesController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        movimentacoesController = new MovimentacoesController();
        movimentacoesController.service = mockMovimentacaoService;
        
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
            const { MovimentacaoIdSchema } = require('../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js');
            MovimentacaoIdSchema.parse = jest.fn().mockReturnValue('123');

            expect(() => movimentacoesController.validateId('123')).not.toThrow();
            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith('123');
        });

        it('deve lançar erro quando ID não for fornecido', () => {
            expect(() => movimentacoesController.validateId(null)).toThrow();
        });

        it('deve personalizar mensagem de erro', () => {
            expect(() => 
                movimentacoesController.validateId(null, 'produtoId', 'deletar')
            ).toThrow();
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

            MovimentacaoService.prototype.listarMovimentacoes = jest.fn().mockResolvedValue(mockMovimentacoes);
            CommonResponse.success = jest.fn().mockReturnValue('response');

            const result = await movimentacoesController.listarMovimentacoes(mockReq, mockRes);

            expect(MovimentacaoService.prototype.listarMovimentacoes).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockMovimentacoes);
            expect(result).toBe('response');
        });

        it('deve retornar erro quando nenhuma movimentação for encontrada', async () => {
            const mockMovimentacoes = { docs: [] };
            MovimentacaoService.prototype.listarMovimentacoes = jest.fn().mockResolvedValue(mockMovimentacoes);
            CommonResponse.error = jest.fn().mockReturnValue('error_response');

            const result = await movimentacoesController.listarMovimentacoes(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                "resourceNotFound",
                "Movimentacao",
                [],
                "Nenhuma movimentação encontrada com os critérios informados."
            );
            expect(result).toBe('error_response');
        });

        it('deve validar ID quando fornecido nos params', async () => {
            const { MovimentacaoIdSchema } = require('../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js');
            MovimentacaoIdSchema.parse = jest.fn().mockReturnValue('123');
            
            const mockMovimentacoes = { docs: [{ id: '1' }] };
            MovimentacaoService.prototype.listarMovimentacoes = jest.fn().mockResolvedValue(mockMovimentacoes);
            CommonResponse.success = jest.fn().mockReturnValue('response');

            mockReq.params = { id: '123' };

            await movimentacoesController.listarMovimentacoes(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith('123');
        });

        it('deve validar query quando fornecida', async () => {
            const { MovimentacaoQuerySchema } = require('../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js');
            MovimentacaoQuerySchema.parseAsync = jest.fn().mockResolvedValue({});
            
            const mockMovimentacoes = { docs: [{ id: '1' }] };
            MovimentacaoService.prototype.listarMovimentacoes = jest.fn().mockResolvedValue(mockMovimentacoes);
            CommonResponse.success = jest.fn().mockReturnValue('response');

            mockReq.query = { tipo: 'entrada' };

            await movimentacoesController.listarMovimentacoes(mockReq, mockRes);

            expect(MovimentacaoQuerySchema.parseAsync).toHaveBeenCalledWith({ tipo: 'entrada' });
        });
    });

    describe('buscarMovimentacaoPorID', () => {
        it('deve buscar movimentação por ID com sucesso', async () => {
            const { MovimentacaoIdSchema } = require('../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js');
            MovimentacaoIdSchema.parse = jest.fn().mockReturnValue('123');
            
            const mockMovimentacao = { id: '123', tipo: 'entrada', quantidade: 10 };
            MovimentacaoService.prototype.buscarMovimentacaoPorID = jest.fn().mockResolvedValue(mockMovimentacao);
            CommonResponse.success = jest.fn().mockReturnValue('response');

            mockReq.params = { id: '123' };

            const result = await movimentacoesController.buscarMovimentacaoPorID(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith('123');
            expect(MovimentacaoService.prototype.buscarMovimentacaoPorID).toHaveBeenCalledWith('123');
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockMovimentacao,
                200,
                "Movimentação encontrada com sucesso."
            );
            expect(result).toBe('response');
        });

        it('deve propagar erro do service', async () => {
            const { MovimentacaoIdSchema } = require('../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js');
            MovimentacaoIdSchema.parse = jest.fn().mockReturnValue('999');
            
            const mockError = new Error('Movimentação não encontrada');
            MovimentacaoService.prototype.buscarMovimentacaoPorID = jest.fn().mockRejectedValue(mockError);

            mockReq.params = { id: '999' };

            await expect(movimentacoesController.buscarMovimentacaoPorID(mockReq, mockRes))
                .rejects.toThrow('Movimentação não encontrada');
        });
    });

    describe('buscarMovimentacoes', () => {
        it('deve buscar movimentações por tipo', async () => {
            const mockMovimentacoes = [
                { id: '1', tipo: 'entrada' }
            ];

            MovimentacaoService.prototype.buscarMovimentacoesPorTipo = jest.fn().mockResolvedValue(mockMovimentacoes);
            CommonResponse.success = jest.fn().mockReturnValue('response');

            mockReq.query = { tipo: 'entrada', page: 1, limite: 10 };

            const result = await movimentacoesController.buscarMovimentacoes(mockReq, mockRes);

            expect(MovimentacaoService.prototype.buscarMovimentacoesPorTipo).toHaveBeenCalledWith('entrada', 1, 10);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockMovimentacoes);
            expect(result).toBe('response');
        });

        it('deve usar valores padrão para page e limite', async () => {
            const mockMovimentacoes = [];
            MovimentacaoService.prototype.buscarMovimentacoesPorTipo = jest.fn().mockResolvedValue(mockMovimentacoes);
            CommonResponse.success = jest.fn().mockReturnValue('response');

            mockReq.query = { tipo: 'entrada' };

            await movimentacoesController.buscarMovimentacoes(mockReq, mockRes);

            expect(MovimentacaoService.prototype.buscarMovimentacoesPorTipo).toHaveBeenCalledWith('entrada', 1, 10);
        });

        it('deve limitar o limite máximo a 100', async () => {
            const mockMovimentacoes = [];
            MovimentacaoService.prototype.buscarMovimentacoesPorTipo = jest.fn().mockResolvedValue(mockMovimentacoes);
            CommonResponse.success = jest.fn().mockReturnValue('response');

            mockReq.query = { tipo: 'entrada', limite: 200 };

            await movimentacoesController.buscarMovimentacoes(mockReq, mockRes);

            expect(MovimentacaoService.prototype.buscarMovimentacoesPorTipo).toHaveBeenCalledWith('entrada', 1, 100);
        });

        it('deve retornar erro quando nenhum filtro for aplicado', async () => {
            CommonResponse.error = jest.fn().mockReturnValue('error_response');

            mockReq.query = { page: 1 };

            const result = await movimentacoesController.buscarMovimentacoes(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                400,
                "validationError",
                "query",
                [],
                "É necessário informar pelo menos um filtro: tipo, período ou produto."
            );
            expect(result).toBe('error_response');
        });
    });
});

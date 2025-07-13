import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/services/grupoService.js', () => {
    return jest.fn().mockImplementation(() => ({
        listar: jest.fn(),
        buscarPorId: jest.fn(),
        criar: jest.fn(),
        atualizar: jest.fn(),
        deletar: jest.fn(),
        adicionarPermissao: jest.fn(),
        removerPermissao: jest.fn(),
        adicionarUsuario: jest.fn(),
        removerUsuario: jest.fn(),
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
        OK: { code: 200 },
        CREATED: { code: 201 },
        BAD_REQUEST: { code: 400 },
        NOT_FOUND: { code: 404 },
    },
}));

jest.mock('../../src/utils/validators/schemas/zod/GrupoSchema.js', () => ({
    GrupoSchema: {
        parse: jest.fn(),
        parseAsync: jest.fn(),
    },
    GrupoUpdateSchema: {
        parse: jest.fn(),
        parseAsync: jest.fn(),
    },
    GrupoPermissaoSchema: {
        parse: jest.fn(),
        parseAsync: jest.fn(),
    },
}));

jest.mock('../../src/utils/validators/schemas/zod/querys/GrupoQuerySchema.js', () => ({
    GrupoIdSchema: {
        parse: jest.fn(),
    },
    GrupoQuerySchema: {
        parse: jest.fn(),
    },
}));

jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    __esModule: true,
    default: {
        logAction: jest.fn(),
        logCriticalEvent: jest.fn(),
        startSession: jest.fn(),
        endSession: jest.fn(),
        logFailedLogin: jest.fn(),
        getUserLogs: jest.fn(),
        searchEvents: jest.fn(),
        log: jest.fn(() => (req, res, next) => next()),
    },
}));

import GrupoController from '../../src/controllers/GrupoController.js';
import GrupoService from '../../src/services/grupoService.js';
import { CommonResponse, HttpStatusCodes } from '../../src/utils/helpers/index.js';
import { GrupoIdSchema, GrupoQuerySchema } from '../../src/utils/validators/schemas/zod/querys/GrupoQuerySchema.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';

describe('GrupoController', () => {
    let grupoController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        grupoController = new GrupoController();
        
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

    describe('listar', () => {
        it('deve listar grupos com sucesso', async () => {
            const mockGrupos = {
                docs: [
                    { id: '1', nome: 'Administradores', descricao: 'Grupo admin' },
                    { id: '2', nome: 'Estoquistas', descricao: 'Grupo estoque' }
                ]
            };

            grupoController.service.listar.mockResolvedValue(mockGrupos);
            CommonResponse.success.mockReturnValue('success response');

            const result = await grupoController.listar(mockReq, mockRes);

            expect(grupoController.service.listar).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockGrupos, 
                200, 
                'Grupos listados com sucesso.'
            );
            expect(result).toBe('success response');
        });

        it('deve retornar erro quando nenhum grupo for encontrado', async () => {
            const mockGrupos = { docs: [] };

            grupoController.service.listar.mockResolvedValue(mockGrupos);
            CommonResponse.error.mockReturnValue('error response');

            const result = await grupoController.listar(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                HttpStatusCodes.NOT_FOUND.code,
                'resourceNotFound',
                'Grupo',
                [],
                'Nenhum grupo encontrado com os critérios informados.'
            );
            expect(result).toBe('error response');
        });

        it('deve validar query quando fornecida', async () => {
            mockReq.query = { nome: 'admin' };
            GrupoQuerySchema.parse.mockReturnValue(mockReq.query);
            
            const mockGrupos = {
                docs: [{ id: '1', nome: 'Administradores' }]
            };
            grupoController.service.listar.mockResolvedValue(mockGrupos);

            await grupoController.listar(mockReq, mockRes);

            expect(GrupoQuerySchema.parse).toHaveBeenCalledWith(mockReq.query);
        });

        it('deve validar ID quando fornecido nos params', async () => {
            mockReq.params = { id: '123' };
            GrupoIdSchema.parse.mockReturnValue('123');
            
            const mockGrupos = {
                docs: [{ id: '123', nome: 'Grupo Teste' }]
            };
            grupoController.service.listar.mockResolvedValue(mockGrupos);

            await grupoController.listar(mockReq, mockRes);

            expect(GrupoIdSchema.parse).toHaveBeenCalledWith('123');
        });
    });

    describe('buscarPorId', () => {
        it('deve buscar grupo por ID com sucesso', async () => {
            const mockGrupo = { id: '123', nome: 'Grupo Teste', descricao: 'Descrição teste' };
            mockReq.params = { id: '123' };
            
            GrupoIdSchema.parse.mockReturnValue('123');
            grupoController.service.buscarPorId.mockResolvedValue(mockGrupo);
            CommonResponse.success.mockReturnValue('success response');

            const result = await grupoController.buscarPorId(mockReq, mockRes);

            expect(GrupoIdSchema.parse).toHaveBeenCalledWith('123');
            expect(grupoController.service.buscarPorId).toHaveBeenCalledWith('123');
            expect(result).toBe('success response');
        });

        it('deve propagar erro do service', async () => {
            const error = new Error('Grupo não encontrado');
            mockReq.params = { id: '999' };
            
            GrupoIdSchema.parse.mockReturnValue('999');
            grupoController.service.buscarPorId.mockRejectedValue(error);

            await expect(grupoController.buscarPorId(mockReq, mockRes))
                .rejects.toThrow('Grupo não encontrado');
        });
    });

    describe('criar', () => {
        it('deve criar grupo com sucesso', async () => {
            const mockGrupo = {
                id: 'grupo123',
                nome: 'Novo Grupo',
                descricao: 'Descrição do novo grupo'
            };

            const validatedData = { nome: 'Novo Grupo', descricao: 'Descrição do novo grupo' };
            mockReq.body = { nome: 'Novo Grupo', descricao: 'Descrição do novo grupo' };
            
            // Mock schema validation
            const { GrupoSchema } = require('../../src/utils/validators/schemas/zod/GrupoSchema.js');
            GrupoSchema.parse.mockReturnValue(validatedData);
            
            grupoController.service.criar.mockResolvedValue(mockGrupo);
            CommonResponse.created.mockReturnValue('created response');

            const result = await grupoController.criar(mockReq, mockRes);

            expect(GrupoSchema.parse).toHaveBeenCalledWith(mockReq.body);
            expect(grupoController.service.criar).toHaveBeenCalledWith(validatedData);
            expect(result).toBe('created response');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar grupo com sucesso', async () => {
            const mockGrupo = { id: '123', nome: 'Grupo Atualizado' };
            const validatedData = { nome: 'Grupo Atualizado' };

            mockReq.params = { id: '123' };
            mockReq.body = { nome: 'Grupo Atualizado' };
            
            // Mock schema validations
            const { GrupoUpdateSchema } = require('../../src/utils/validators/schemas/zod/GrupoSchema.js');
            const { GrupoIdSchema } = require('../../src/utils/validators/schemas/zod/querys/GrupoQuerySchema.js');
            
            GrupoIdSchema.parse.mockReturnValue('123');
            GrupoUpdateSchema.parse.mockReturnValue(validatedData);
            
            grupoController.service.atualizar.mockResolvedValue(mockGrupo);
            CommonResponse.success.mockReturnValue('success response');

            const result = await grupoController.atualizar(mockReq, mockRes);

            expect(GrupoIdSchema.parse).toHaveBeenCalledWith('123');
            expect(GrupoUpdateSchema.parse).toHaveBeenCalledWith(mockReq.body);
            expect(grupoController.service.atualizar).toHaveBeenCalledWith('123', validatedData);
            expect(result).toBe('success response');
        });
    });
});

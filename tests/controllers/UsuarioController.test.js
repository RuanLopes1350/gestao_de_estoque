import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/services/usuarioService.js', () => {
    return jest.fn().mockImplementation(() => ({
        listarUsuarios: jest.fn(),
        cadastrarUsuario: jest.fn(),
        buscarUsuarioPorID: jest.fn(),
        buscarUsuarioPorMatricula: jest.fn(),
        atualizarUsuario: jest.fn(),
        deletarUsuario: jest.fn(),
        desativarUsuario: jest.fn(),
        reativarUsuario: jest.fn(),
        criarComSenha: jest.fn(),
        adicionarUsuarioAoGrupo: jest.fn(),
        removerUsuarioDoGrupo: jest.fn(),
        adicionarPermissaoAoUsuario: jest.fn(),
        removerPermissaoDoUsuario: jest.fn(),
        obterPermissoesUsuario: jest.fn(),
    }));
});

jest.mock('../../src/services/EmailService.js', () => ({
    default: {
        enviarCodigoCadastro: jest.fn(),
    }
}));

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

jest.mock('../../src/utils/validators/schemas/zod/UsuarioSchema.js', () => ({
    UsuarioSchema: { parse: jest.fn() },
    UsuarioUpdateSchema: { parseAsync: jest.fn() },
}));

jest.mock('../../src/utils/validators/schemas/zod/querys/UsuarioQuerySchema.js', () => ({
    UsuarioQuerySchema: { parseAsync: jest.fn() },
    UsuarioIdSchema: {
        parse: jest.fn((id) => {
            if (!id || typeof id !== 'string' || id.length !== 24) {
                throw new Error('Invalid ObjectId');
            }
            return id;
        })
    },
    UsuarioMatriculaSchema: { parse: jest.fn() },
}));

jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
  __esModule: true,
  default: { logCriticalEvent: jest.fn() }
}));

// Importar o controller
import UsuarioController from '../../src/controllers/UsuarioController.js';
import UsuarioService from '../../src/services/usuarioService.js';
import EmailService from '../../src/services/EmailService.js';
import { CommonResponse } from '../../src/utils/helpers/index.js';
import { UsuarioSchema } from '../../src/utils/validators/schemas/zod/UsuarioSchema.js';
import { UsuarioQuerySchema, UsuarioIdSchema } from '../../src/utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';

// Mock do console.log para evitar poluir a saída dos testes
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('UsuarioController', () => {
    let usuarioController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        usuarioController = new UsuarioController();
        
        // Mock response object
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        // Mock request object
        mockReq = {
            params: {},
            query: {},
            body: {},
            userId: '507f1f77bcf86cd799439011',
            userMatricula: '12345'
        };

        // Limpar mocks
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with UsuarioService', () => {
            expect(usuarioController.service).toBeDefined();
        });
    });

    describe('validateId method', () => {
        it('should validate valid ObjectId', () => {
            const validId = '507f1f77bcf86cd799439011';
            
            expect(() => usuarioController.validateId(validId)).not.toThrow();
        });

        it('should throw error for empty ID', () => {
            expect(() => usuarioController.validateId('')).toThrow();
        });

        it('should throw error for null ID', () => {
            expect(() => usuarioController.validateId(null)).toThrow();
        });

        it('should throw error for undefined ID', () => {
            expect(() => usuarioController.validateId(undefined)).toThrow();
        });
    });

    describe('listarUsuarios', () => {
        it('should return usuarios list successfully', async () => {
            const mockData = {
                docs: [
                    { _id: '507f1f77bcf86cd799439011', nome: 'Usuario 1' },
                    { _id: '507f1f77bcf86cd799439012', nome: 'Usuario 2' }
                ]
            };
            
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(usuarioController.service.listarUsuarios).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockData);
        });

        it('should return error when no usuarios found', async () => {
            const mockData = { docs: [] };
            
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Usuario',
                [],
                'Nenhum usuário encontrado com os critérios informados.'
            );
        });

        it('should validate ID when provided in params', async () => {
            mockReq.params.id = '507f1f77bcf86cd799439011';
            const mockData = { docs: [{ _id: '507f1f77bcf86cd799439011', nome: 'Usuario 1' }] };
            
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should validate query when provided', async () => {
            mockReq.query = { nome: 'test' };
            const mockData = { docs: [{ _id: '507f1f77bcf86cd799439011', nome: 'test' }] };
            
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(UsuarioQuerySchema.parseAsync).toHaveBeenCalledWith({ nome: 'test' });
        });
    });

    describe('buscarUsuarioPorID', () => {
        it('should return user by ID successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, nome: 'Usuario Teste' };
            
            mockReq.params.id = userId;
            usuarioController.service.buscarUsuarioPorID.mockResolvedValue(mockUser);
            
            await usuarioController.buscarUsuarioPorID(mockReq, mockRes);
            
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith(userId);
            expect(usuarioController.service.buscarUsuarioPorID).toHaveBeenCalledWith(userId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockUser, 
                200, 
                'Usuário encontrado com sucesso.'
            );
        });
    });

    describe('buscarUsuarioPorMatricula', () => {
        it('should return user by matricula successfully', async () => {
            const matricula = '12345';
            const mockUser = { _id: '507f1f77bcf86cd799439011', matricula };
            
            mockReq.params.matricula = matricula;
            usuarioController.service.buscarUsuarioPorMatricula.mockResolvedValue(mockUser);
            
            await usuarioController.buscarUsuarioPorMatricula(mockReq, mockRes);
            
            expect(usuarioController.service.buscarUsuarioPorMatricula).toHaveBeenCalledWith(matricula);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockUser, 
                200, 
                'Usuário encontrado com sucesso.'
            );
        });

        it('should throw error when matricula is not provided', async () => {
            mockReq.params = {};
            
            await expect(usuarioController.buscarUsuarioPorMatricula(mockReq, mockRes)).rejects.toThrow();
        });
    });

    describe('cadastrarUsuario', () => {
        it('should create user without password successfully', async () => {
            const userData = { nome: 'Test User', email: 'test@example.com' };
            const mockCreatedUser = { 
                _id: '507f1f77bcf86cd799439011', 
                ...userData, 
                matricula: '12345',
                toObject: () => ({ _id: '507f1f77bcf86cd799439011', ...userData })
            };
            
            mockReq.body = userData;
            UsuarioSchema.parse.mockReturnValue(userData);
            usuarioController.service.cadastrarUsuario.mockResolvedValue(mockCreatedUser);
            EmailService.enviarCodigoCadastro = jest.fn().mockResolvedValue({ 
                sentViaEmail: true, 
                reason: null 
            });
            
            await usuarioController.cadastrarUsuario(mockReq, mockRes);
            
            expect(UsuarioSchema.parse).toHaveBeenCalledWith(userData);
            expect(usuarioController.service.cadastrarUsuario).toHaveBeenCalled();
            expect(EmailService.enviarCodigoCadastro).toHaveBeenCalled();
            expect(CommonResponse.created).toHaveBeenCalled();
        });

        it('should create user with password successfully', async () => {
            const userData = { nome: 'Test User', email: 'test@example.com', senha: 'password123' };
            const mockCreatedUser = { 
                _id: '507f1f77bcf86cd799439011', 
                ...userData,
                toObject: () => ({ _id: '507f1f77bcf86cd799439011', ...userData })
            };
            
            mockReq.body = userData;
            UsuarioSchema.parse.mockReturnValue(userData);
            usuarioController.service.cadastrarUsuario.mockResolvedValue(mockCreatedUser);
            
            await usuarioController.cadastrarUsuario(mockReq, mockRes);
            
            expect(usuarioController.service.cadastrarUsuario).toHaveBeenCalledWith(userData);
            expect(CommonResponse.created).toHaveBeenCalled();
        });
    });

    describe('atualizarUsuario', () => {
        it('should update user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const updateData = { nome: 'Updated Name' };
            const mockUpdatedUser = { _id: userId, ...updateData };
            
            mockReq.params.id = userId;
            mockReq.body = updateData;
            usuarioController.service.atualizarUsuario.mockResolvedValue(mockUpdatedUser);
            
            await usuarioController.atualizarUsuario(mockReq, mockRes);
            
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith(userId);
            expect(usuarioController.service.atualizarUsuario).toHaveBeenCalledWith(userId, updateData);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockUpdatedUser, 
                200, 
                'Usuário atualizado com sucesso.'
            );
        });
    });

    describe('deletarUsuario', () => {
        it('should delete user successfully', async () => {
            const matricula = '12345';
            const mockDeletedUser = { _id: '507f1f77bcf86cd799439011', matricula };
            
            mockReq.params.matricula = matricula;
            usuarioController.service.deletarUsuario.mockResolvedValue(mockDeletedUser);
            
            await usuarioController.deletarUsuario(mockReq, mockRes);
            
            expect(usuarioController.service.deletarUsuario).toHaveBeenCalledWith(matricula);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockDeletedUser, 
                200, 
                'Usuário excluído com sucesso.'
            );
        });
    });

    describe('desativarUsuario', () => {
        it('should deactivate user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, ativo: false };
            
            mockReq.params.id = userId;
            usuarioController.service.desativarUsuario.mockResolvedValue(mockUser);
            
            await usuarioController.desativarUsuario(mockReq, mockRes);
            
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith(userId);
            expect(usuarioController.service.desativarUsuario).toHaveBeenCalledWith(userId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockUser, 
                200, 
                'Usuario desativado com sucesso.'
            );
        });
    });

    describe('reativarUsuario', () => {
        it('should reactivate user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, ativo: true };
            
            mockReq.params.id = userId;
            usuarioController.service.reativarUsuario.mockResolvedValue(mockUser);
            
            await usuarioController.reativarUsuario(mockReq, mockRes);
            
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith(userId);
            expect(usuarioController.service.reativarUsuario).toHaveBeenCalledWith(userId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockUser, 
                200, 
                'Usuario reativado com sucesso.'
            );
        });
    });

    describe('obterPermissoesUsuario', () => {
        it('should get user permissions successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockPermissions = { permissions: ['read', 'write'] };
            
            mockReq.params.id = userId;
            usuarioController.service.obterPermissoesUsuario.mockResolvedValue(mockPermissions);
            
            await usuarioController.obterPermissoesUsuario(mockReq, mockRes);
            
            expect(usuarioController.service.obterPermissoesUsuario).toHaveBeenCalledWith(userId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockPermissions, 
                200, 
                'Permissões do usuário obtidas com sucesso.'
            );
        });
    });
});

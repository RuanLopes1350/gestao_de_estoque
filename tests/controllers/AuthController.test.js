import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/services/AuthService.js', () => ({
    AuthService: jest.fn().mockImplementation(() => ({
        autenticar: jest.fn(),
        logout: jest.fn(),
        refreshToken: jest.fn(),
        alterarSenha: jest.fn(),
        solicitarRecuperacao: jest.fn(),
        verificarCodigoRecuperacao: jest.fn(),
        redefinirSenha: jest.fn(),
    })),
}));

jest.mock('../../src/utils/helpers/CommonResponse.js', () => ({
    __esModule: true,
    default: class MockCommonResponse {
        static success = jest.fn();
        static error = jest.fn();
        static created = jest.fn();
    }
}));

jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    __esModule: true,
    default: {
        startSession: jest.fn(),
        endSession: jest.fn(),
        logAction: jest.fn(),
        logCriticalEvent: jest.fn(),
        logFailedLogin: jest.fn(),
        getUserLogs: jest.fn(),
        searchEvents: jest.fn(),
        log: jest.fn(() => (req, res, next) => next()),
    },
}));

import AuthController from '../../src/controllers/AuthController.js';
import { AuthService } from '../../src/services/AuthService.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';
import CommonResponse from '../../src/utils/helpers/CommonResponse.js';

describe('AuthController', () => {
    let authController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // AuthController já é uma instância, não precisamos criar uma nova
        authController = AuthController;
        
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

    describe('login', () => {
        it('deve fazer login com sucesso', async () => {
            const mockAuthData = {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                usuario: {
                    id: 'user123',
                    matricula: 'MAT123',
                    nome_usuario: 'João Silva',
                    perfil: 'estoquista'
                }
            };

            mockReq.body = { matricula: 'MAT123', senha: 'senha123' };
            authController.service.autenticar.mockResolvedValue(mockAuthData);

            await authController.login(mockReq, mockRes);

            expect(authController.service.autenticar).toHaveBeenCalledWith('MAT123', 'senha123');
            expect(LogMiddleware.startSession).toHaveBeenCalledWith(
                'user123',
                {
                    matricula: 'MAT123',
                    nome: 'João Silva',
                    perfil: 'estoquista'
                },
                mockReq
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Login realizado com sucesso',
                ...mockAuthData
            });
        });

        it('deve retornar erro quando matrícula não for fornecida', async () => {
            mockReq.body = { senha: 'senha123' };

            await authController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Matrícula e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('deve retornar erro quando senha não for fornecida', async () => {
            mockReq.body = { matricula: 'MAT123' };

            await authController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Matrícula e senha são obrigatórios',
                type: 'validationError'
            });
        });
    });

    describe('logout', () => {
        it('deve fazer logout com sucesso', async () => {
            mockReq.userId = 'user123';
            authController.service.logout.mockResolvedValue();

            await authController.logout(mockReq, mockRes);

            expect(authController.service.logout).toHaveBeenCalledWith('user123');
            expect(LogMiddleware.endSession).toHaveBeenCalledWith('user123', 'manual');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logout realizado com sucesso'
            });
        });
    });
});
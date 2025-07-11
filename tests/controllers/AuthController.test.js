import AuthController from '../../src/controllers/AuthController.js';
import { AuthService } from '../../src/services/AuthService.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';
import { jest } from '@jest/globals';

// Mock das dependências
jest.mock('../../src/services/AuthService.js', () => ({
    AuthService: jest.fn().mockImplementation(() => ({
        autenticar: jest.fn(),
        logout: jest.fn(),
        refreshToken: jest.fn(),
        revoke: jest.fn(),
        recuperarSenha: jest.fn(),
        redefinirSenhaComToken: jest.fn(),
        redefinirSenhaComCodigo: jest.fn()
    }))
}));
jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    startSession: jest.fn(),
    endSession: jest.fn(),
    logCriticalEvent: jest.fn()
}));

describe('AuthController', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            query: {},
            userId: 'user123',
            userMatricula: 'MAT123'
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Reset dos mocks
        jest.clearAllMocks();
        
        // Recria a instância do controller para ter uma nova instância do service
        AuthController.service = new AuthService();
    });

    describe('login', () => {
        it('deve fazer login com sucesso', async () => {
            const mockAuthData = {
                usuario: {
                    id: '123',
                    matricula: 'MAT123',
                    nome_usuario: 'Teste',
                    perfil: 'admin'
                },
                accessToken: 'access_token',
                refreshToken: 'refresh_token'
            };

            AuthController.service.autenticar.mockResolvedValue(mockAuthData);

            mockReq.body = {
                matricula: 'MAT123',
                senha: 'senha123'
            };

            await AuthController.login(mockReq, mockRes);

            expect(AuthController.service.autenticar).toHaveBeenCalledWith('MAT123', 'senha123');
            expect(LogMiddleware.startSession).toHaveBeenCalledWith(
                '123',
                {
                    matricula: 'MAT123',
                    nome_usuario: 'Teste',
                    perfil: 'admin'
                },
                mockReq
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Login realizado com sucesso',
                ...mockAuthData
            });
        });

        it('deve retornar erro 400 quando matrícula não for fornecida', async () => {
            mockReq.body = {
                senha: 'senha123'
            };

            await AuthController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Matrícula e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('deve retornar erro 400 quando senha não for fornecida', async () => {
            mockReq.body = {
                matricula: 'MAT123'
            };

            await AuthController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Matrícula e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('deve propagar erro do service', async () => {
            const mockError = new Error('Credenciais inválidas');
            AuthController.service.autenticar.mockRejectedValue(mockError);

            mockReq.body = {
                matricula: 'MAT123',
                senha: 'senha_errada'
            };

            await expect(AuthController.login(mockReq, mockRes)).rejects.toThrow('Credenciais inválidas');
        });
    });

    describe('logout', () => {
        it('deve fazer logout com sucesso', async () => {
            AuthController.service.logout.mockResolvedValue();

            await AuthController.logout(mockReq, mockRes);

            expect(AuthController.service.logout).toHaveBeenCalledWith('user123');
            expect(LogMiddleware.endSession).toHaveBeenCalledWith('user123', 'manual');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logout realizado com sucesso'
            });
        });

        it('deve propagar erro do service', async () => {
            const mockError = new Error('Erro no logout');
            AuthController.service.logout.mockRejectedValue(mockError);

            await expect(AuthController.logout(mockReq, mockRes)).rejects.toThrow('Erro no logout');
        });
    });

    describe('refresh', () => {
        it('deve atualizar token com sucesso', async () => {
            const mockTokens = {
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token'
            };

            AuthController.service.refreshToken.mockResolvedValue(mockTokens);

            mockReq.body = {
                refreshToken: 'valid_refresh_token'
            };

            await AuthController.refresh(mockReq, mockRes);

            expect(AuthController.service.refreshToken).toHaveBeenCalledWith('valid_refresh_token');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token atualizado com sucesso',
                ...mockTokens
            });
        });

        it('deve retornar erro 400 quando refresh token não for fornecido', async () => {
            mockReq.body = {};

            await AuthController.refresh(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token de atualização não fornecido',
                type: 'validationError'
            });
        });

        it('deve propagar erro do service', async () => {
            const mockError = new Error('Token inválido');
            AuthController.service.refreshToken.mockRejectedValue(mockError);

            mockReq.body = {
                refreshToken: 'invalid_token'
            };

            await expect(AuthController.refresh(mockReq, mockRes)).rejects.toThrow('Token inválido');
        });
    });

    describe('revoke', () => {
        it('deve revogar token com sucesso', async () => {
            AuthController.service.revoke.mockResolvedValue();

            mockReq.body = {
                matricula: 'MAT456'
            };

            await AuthController.revoke(mockReq, mockRes);

            expect(AuthController.service.revoke).toHaveBeenCalledWith('MAT456');
            expect(LogMiddleware.logCriticalEvent).toHaveBeenCalledWith(
                'user123',
                'TOKEN_REVOKE',
                {
                    matricula_revogada: 'MAT456',
                    revogado_por: 'MAT123'
                },
                mockReq
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token revogado com sucesso'
            });
        });

        it('deve retornar erro 400 quando body não for fornecido', async () => {
            mockReq.body = null;

            await AuthController.revoke(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Corpo da requisição ausente',
                type: 'validationError'
            });
        });

        it('deve retornar erro 400 quando matrícula não for fornecida', async () => {
            mockReq.body = {};

            await AuthController.revoke(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Matrícula não fornecida',
                type: 'validationError'
            });
        });
    });

    describe('solicitarRecuperacaoSenha', () => {
        it('deve solicitar recuperação de senha com sucesso', async () => {
            const mockResultado = {
                message: 'Email de recuperação enviado',
                success: true
            };

            AuthController.service.recuperarSenha.mockResolvedValue(mockResultado);

            mockReq.body = {
                email: 'test@example.com'
            };

            await AuthController.solicitarRecuperacaoSenha(mockReq, mockRes);

            expect(AuthController.service.recuperarSenha).toHaveBeenCalledWith('test@example.com');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockResultado);
        });

        it('deve retornar erro 400 quando email não for fornecido', async () => {
            mockReq.body = {};

            await AuthController.solicitarRecuperacaoSenha(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Email é obrigatório',
                type: 'validationError'
            });
        });
    });

    describe('redefinirSenhaComToken', () => {
        it('deve redefinir senha com token com sucesso', async () => {
            const mockResultado = {
                message: 'Senha redefinida com sucesso'
            };

            AuthController.service.redefinirSenhaComToken.mockResolvedValue(mockResultado);

            mockReq.query = {
                token: 'valid_token'
            };
            mockReq.body = {
                senha: 'nova_senha123'
            };

            await AuthController.redefinirSenhaComToken(mockReq, mockRes);

            expect(AuthController.service.redefinirSenhaComToken).toHaveBeenCalledWith('valid_token', 'nova_senha123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockResultado);
        });

        it('deve retornar erro 400 quando token não for fornecido', async () => {
            mockReq.query = {};
            mockReq.body = {
                senha: 'nova_senha123'
            };

            await AuthController.redefinirSenhaComToken(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('deve retornar erro 400 quando senha não for fornecida', async () => {
            mockReq.query = {
                token: 'valid_token'
            };
            mockReq.body = {};

            await AuthController.redefinirSenhaComToken(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token e senha são obrigatórios',
                type: 'validationError'
            });
        });
    });

    describe('redefinirSenhaComCodigo', () => {
        it('deve redefinir senha com código com sucesso', async () => {
            const mockResultado = {
                message: 'Senha redefinida com sucesso'
            };

            AuthController.service.redefinirSenhaComCodigo.mockResolvedValue(mockResultado);

            mockReq.body = {
                codigo: '123456',
                senha: 'nova_senha123'
            };

            await AuthController.redefinirSenhaComCodigo(mockReq, mockRes);

            expect(AuthController.service.redefinirSenhaComCodigo).toHaveBeenCalledWith('123456', 'nova_senha123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockResultado);
        });

        it('deve retornar erro 400 quando código não for fornecido', async () => {
            mockReq.body = {
                senha: 'nova_senha123'
            };

            await AuthController.redefinirSenhaComCodigo(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Código e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('deve retornar erro 400 quando senha não for fornecida', async () => {
            mockReq.body = {
                codigo: '123456'
            };

            await AuthController.redefinirSenhaComCodigo(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Código e senha são obrigatórios',
                type: 'validationError'
            });
        });
    });
});

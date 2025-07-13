import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    __esModule: true,
    default: {
        getUserLogs: jest.fn(),
        searchEvents: jest.fn(),
        getOnlineUsers: jest.fn(),
        getUserSessionInfo: jest.fn(),
        clearLogs: jest.fn(),
        startSession: jest.fn(),
        endSession: jest.fn(),
        logCriticalEvent: jest.fn(),
        logFailedLogin: jest.fn(),
        log: jest.fn(() => (req, res, next) => next()),
    },
}));

jest.mock('../../src/repositories/usuarioRepository.js', () => {
    return jest.fn().mockImplementation(() => ({
        buscarPorId: jest.fn(),
        listarUsuarios: jest.fn(),
        getOnlineUsers: jest.fn(),
    }));
});

import LogController from '../../src/controllers/LogController.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';
import UsuarioRepository from '../../src/repositories/usuarioRepository.js';

describe('LogController', () => {
    let logController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        logController = new LogController();
        
        mockReq = {
            body: {},
            params: {},
            query: {},
            userId: 'user123',
            userMatricula: 'MAT123',
            userPerfil: 'administrador'
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Reset dos mocks
        jest.clearAllMocks();
    });

    describe('getUserLogs', () => {
        it('deve obter logs do usuário com sucesso (administrador)', async () => {
            const mockLogs = [
                { timestamp: '2023-01-01T10:00:00Z', action: 'login', details: 'Login realizado' },
                { timestamp: '2023-01-01T11:00:00Z', action: 'logout', details: 'Logout realizado' }
            ];

            mockReq.params = { userId: 'user456' };
            mockReq.query = { limit: '5' };
            mockReq.userPerfil = 'administrador';
            
            LogMiddleware.getUserLogs.mockReturnValue(mockLogs);

            await logController.getUserLogs(mockReq, mockRes);

            expect(LogMiddleware.getUserLogs).toHaveBeenCalledWith('user456', 5);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logs recuperados com sucesso',
                data: mockLogs,
                total: mockLogs.length
            });
        });

        it('deve obter logs do próprio usuário com sucesso', async () => {
            const mockLogs = [
                { timestamp: '2023-01-01T10:00:00Z', action: 'login', details: 'Login realizado' }
            ];

            mockReq.params = { userId: 'user123' }; // mesmo userId do req.userId
            mockReq.userId = 'user123';
            mockReq.userPerfil = 'estoquista'; // não é admin mas está vendo próprios logs
            
            LogMiddleware.getUserLogs.mockReturnValue(mockLogs);

            await logController.getUserLogs(mockReq, mockRes);

            expect(LogMiddleware.getUserLogs).toHaveBeenCalledWith('user123', 10);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logs recuperados com sucesso',
                data: mockLogs,
                total: mockLogs.length
            });
        });

        it('deve negar acesso quando usuário não é admin e tenta ver logs de outro', async () => {
            mockReq.params = { userId: 'user456' };
            mockReq.userId = 'user123';
            mockReq.userPerfil = 'estoquista';

            await logController.getUserLogs(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Acesso negado. Você só pode visualizar seus próprios logs',
                type: 'permissionError'
            });
        });
    });

    describe('searchEvents', () => {
        it('deve buscar eventos com sucesso (administrador)', async () => {
            const mockEvents = [
                { usuario: 'user123', eventos: [{ tipo: 'LOGIN', timestamp: '2023-01-01T10:00:00Z' }] }
            ];

            mockReq.query = { eventType: 'LOGIN' };
            mockReq.userPerfil = 'administrador';
            
            LogMiddleware.searchEvents.mockReturnValue(mockEvents);

            await logController.searchEvents(mockReq, mockRes);

            expect(LogMiddleware.searchEvents).toHaveBeenCalledWith('LOGIN', undefined, undefined);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Busca realizada com sucesso',
                data: mockEvents,
                total: mockEvents.length
            });
        });

        it('deve negar acesso quando usuário não é administrador', async () => {
            mockReq.userPerfil = 'estoquista';

            await logController.searchEvents(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('deve retornar erro quando eventType não é fornecido', async () => {
            mockReq.userPerfil = 'administrador';
            mockReq.query = {}; // sem eventType

            await logController.searchEvents(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getOnlineUsers', () => {
        it('deve obter usuários ativos com sucesso (administrador)', async () => {
            const mockActiveUsers = [
                { userId: 'user123', sessionStarted: '2023-01-01T10:00:00Z' },
                { userId: 'user456', sessionStarted: '2023-01-01T11:00:00Z' }
            ];

            mockReq.userPerfil = 'administrador';
            
            // Mock da instância do repositório
            logController.usuarioRepository.getOnlineUsers.mockResolvedValue(mockActiveUsers);

            await logController.getOnlineUsers(mockReq, mockRes);

            expect(logController.usuarioRepository.getOnlineUsers).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Usuários online recuperados com sucesso',
                data: mockActiveUsers,
                total: mockActiveUsers.length,
                timestamp: expect.any(String)
            });
        });

        it('deve negar acesso quando usuário não é administrador', async () => {
            mockReq.userPerfil = 'estoquista';

            await logController.getOnlineUsers(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Acesso negado. Apenas administradores podem ver usuários online',
                type: 'permissionError'
            });
        });
    });
});

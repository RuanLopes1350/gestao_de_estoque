import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../src/services/AuthService.js';
import UsuarioRepository from '../../src/repositories/usuarioRepository.js';
import CustomError from '../../src/utils/helpers/CustomError.js';
import TokenUtil from '../../src/utils/TokenUtil.js';
import EmailService from '../../src/services/EmailService.js';

// Mock das dependências
jest.mock('../../src/repositories/usuarioRepository.js');
jest.mock('../../src/utils/helpers/CustomError.js');
jest.mock('../../src/utils/TokenUtil.js');
jest.mock('../../src/services/EmailService.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService;
    let mockUsuarioRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUsuarioRepository = {
            buscarPorMatricula: jest.fn(),
            buscarPorEmail: jest.fn(),
            atualizarTokenRecuperacao: jest.fn(),
            buscarPorCodigoRecuperacao: jest.fn(),
            atualizarSenha: jest.fn(),
            atualizar: jest.fn(),
            removeToken: jest.fn(),
            armazenarTokens: jest.fn(),
            setUserOnlineStatus: jest.fn(),
            buscarPorId: jest.fn(),
        };
        
        UsuarioRepository.mockImplementation(() => mockUsuarioRepository);
        
        authService = new AuthService();
        
        // Mock do process.env
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(authService.usuarioRepository).toBeDefined();
            expect(authService.tokenUtil).toBe(TokenUtil);
            expect(authService.ACCESS_TOKEN_SECRET).toContain('fa218006c604d95fbe4f'); // JWT_SECRET hash
            expect(authService.REFRESH_TOKEN_SECRET).toBeDefined();
        });
    });

    describe('autenticar', () => {
        it('should authenticate user successfully', async () => {
            const matricula = '12345';
            const senha = 'password123';
            const hashedPassword = 'hashedPassword';
            const mockUser = {
                _id: 'user_id',
                matricula,
                senha: hashedPassword,
                ativo: true,
                senha_definida: true,
                nome_usuario: 'Test User',
                email: 'test@example.com',
                perfil: 'user'
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);
            mockUsuarioRepository.armazenarTokens.mockResolvedValue(true);
            mockUsuarioRepository.setUserOnlineStatus.mockResolvedValue(true);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

            const result = await authService.autenticar(matricula, senha);

            expect(mockUsuarioRepository.buscarPorMatricula).toHaveBeenCalledWith(matricula, '+senha +senha_definida');
            expect(bcrypt.compare).toHaveBeenCalledWith(senha, hashedPassword);
            expect(mockUsuarioRepository.armazenarTokens).toHaveBeenCalled();
            expect(mockUsuarioRepository.setUserOnlineStatus).toHaveBeenCalledWith('user_id', true);
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('usuario');
        });

        it('should throw error when user not found', async () => {
            const matricula = '12345';
            const senha = 'password123';

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(null);
            CustomError.mockImplementation((options) => new Error(options.customMessage));

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Matrícula ou senha incorretos'
            });
        });

        it('should throw error when user is inactive', async () => {
            const matricula = '12345';
            const senha = 'password123';
            const mockUser = {
                _id: 'user_id',
                matricula,
                ativo: false,
                senha_definida: true
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);
            CustomError.mockImplementation((options) => new Error(options.customMessage));

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Usuário inativo'
            });
        });

        it('should throw error when password not defined', async () => {
            const matricula = '12345';
            const senha = 'password123';
            const mockUser = {
                _id: 'user_id',
                matricula,
                ativo: true,
                senha_definida: false
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);
            CustomError.mockImplementation((options) => new Error(options.customMessage));

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Usuário ainda não definiu sua senha. Use o código de segurança fornecido para definir sua senha.'
            });
        });

        it('should throw error when password is incorrect', async () => {
            const matricula = '12345';
            const senha = 'wrongpassword';
            const mockUser = {
                _id: 'user_id',
                matricula,
                senha: 'hashedPassword',
                ativo: true,
                senha_definida: true
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            CustomError.mockImplementation((options) => new Error(options.customMessage));

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Matrícula ou senha incorretos'
            });
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const userId = 'user_id';

            mockUsuarioRepository.setUserOnlineStatus.mockResolvedValue(true);
            mockUsuarioRepository.removeToken.mockResolvedValue({ success: true });

            const result = await authService.logout(userId);

            expect(mockUsuarioRepository.setUserOnlineStatus).toHaveBeenCalledWith(userId, false);
            expect(mockUsuarioRepository.removeToken).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ success: true });
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            const refreshToken = 'valid_refresh_token';
            const mockUser = {
                _id: 'user_id',
                matricula: '12345',
                perfil: 'user',
                refreshtoken: refreshToken
            };

            jwt.verify.mockReturnValue({ id: 'user_id' });
            mockUsuarioRepository.buscarPorId.mockResolvedValue(mockUser);
            mockUsuarioRepository.armazenarTokens.mockResolvedValue(true);
            jwt.sign.mockReturnValueOnce('new_access_token').mockReturnValueOnce('new_refresh_token');

            const result = await authService.refreshToken(refreshToken);

            expect(jwt.verify).toHaveBeenCalledWith(refreshToken, authService.REFRESH_TOKEN_SECRET);
            expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith('user_id');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });
    });
});

// AuthService.test.js

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

jest.mock('../../../repositories/UsuarioRepository.js', () => {
    return jest.fn().mockImplementation(() => {
        return {
            buscarPorEmail: jest.fn(),
            buscarPorId: jest.fn(),
        };
    });
});

jest.mock('../../../repositories/AuthRepository.js', () => {
    return jest.fn().mockImplementation(() => {
        return {
            armazenarTokens: jest.fn(),
            removeToken: jest.fn(),
        };
    });
});

import AuthService from '../../../services/AuthService.js';
import UsuarioRepository from '../../../repositories/UsuarioRepository.js';
import AuthRepository from '../../../repositories/AuthRepository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomError, messages } from '../../../utils/helpers/index.js';

describe('AuthService', () => {
    let authService;
    let usuarioRepository;
    let authRepository;
    const validId = '507f1f77bcf86cd799439011'; // ObjectId válido

    beforeEach(() => {
        usuarioRepository = new UsuarioRepository();
        authRepository = new AuthRepository();
        authService = new AuthService();

        authService.usuarioRepository = usuarioRepository;
        authService.repository = authRepository; // Garantindo que logout use o mock
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('deve lançar um erro se o usuário não for encontrado', async () => {
            usuarioRepository.buscarPorEmail.mockResolvedValue(null);

            await expect(authService.login({ email: 'test@example.com', senha: 'password' }))
                .rejects
                .toMatchObject({
                    statusCode: 404,
                    customMessage: messages.error.resourceNotFound('Email'),
                });
        });

        it('deve lançar um erro se a senha for inválida', async () => {
            const user = { _id: validId, email: 'test@example.com', senha: 'hashedpassword' };
            usuarioRepository.buscarPorEmail.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(false);

            await expect(authService.login({ email: 'test@example.com', senha: 'password' }))
                .rejects
                .toMatchObject({
                    statusCode: 401,
                    customMessage: messages.error.unauthorized('Senha'),
                });
        });

        it('deve retornar accesstoken, refreshtoken e usuário se o login for bem-sucedido', async () => {
            const user = { _id: validId, email: 'test@example.com', senha: 'hashedpassword' };
            usuarioRepository.buscarPorEmail.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('token');
            authRepository.armazenarTokens.mockResolvedValue();

            const result = await authService.login({ email: 'test@example.com', senha: 'password' });

            expect(result).toHaveProperty('accesstoken', 'token');
            expect(result).toHaveProperty('refreshtoken', 'token');
            expect(result.user).toMatchObject({
                _id: validId,
                email: 'test@example.com',
            });
            // Agora deve passar, pois removemos completamente a chave 'senha'
            expect(result.user).not.toHaveProperty('senha');
        });
    });

    describe('logout', () => {
        it('deve remover o token e retornar dados', async () => {
            authRepository.removeToken.mockResolvedValue({ success: true });

            const result = await authService.logout(validId, 'token');

            expect(result).toHaveProperty('data');
            expect(result.data).toHaveProperty('success', true);
        });
    });

    describe('refresh', () => {
        it('deve lançar um erro se o usuário não for encontrado', async () => {
            usuarioRepository.buscarPorId.mockResolvedValue(null);

            await expect(authService.refresh(validId, 'token'))
                .rejects
                .toMatchObject({
                    statusCode: 404,
                    field: 'Token',
                });
        });

        it('deve lançar um erro se o token for inválido', async () => {
            const user = { _id: validId, refreshtoken: 'differenttoken' };
            usuarioRepository.buscarPorId.mockResolvedValue(user);

            await expect(authService.refresh(validId, 'token'))
                .rejects
                .toMatchObject({
                    statusCode: 401,
                    customMessage: messages.error.unauthorized('Token'),
                });
        });

        it('deve retornar um novo accesstoken e refreshtoken se a atualização for bem-sucedida', async () => {
            const user = { _id: validId, refreshtoken: 'token' };
            usuarioRepository.buscarPorId.mockResolvedValue(user);
            jwt.sign.mockReturnValue('newtoken');
            authRepository.armazenarTokens.mockResolvedValue();

            const result = await authService.refresh(validId, 'token');

            expect(result).toHaveProperty('accesstoken', 'newtoken');
            expect(result).toHaveProperty('refreshtoken', 'newtoken');
        });
    });

    describe('recuperaSenha', () => {
        it('deve retornar uma mensagem se o email for encontrado', async () => {
            const user = { _id: validId, email: 'test@example.com' };
            usuarioRepository.buscarPorEmail.mockResolvedValue(user);

            const result = await authService.recuperaSenha({ email: 'test@example.com' });

            expect(result).toHaveProperty(
                'message',
                'Solicição de recuperação de senha recebida, um email será enviado com as instruções para recuperação de senha'
            );
        });
    });
});

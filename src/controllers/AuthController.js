import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import AuthService from '../services/AuthService.js';
import CustomError from '../utils/helpers/CustomError.js';

dotenv.config();

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    async login(req, res) {
        try {
            const { matricula, senha } = req.body;

            if (!matricula || !senha) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    customMessage: 'Matrícula e senha são obrigatórios'
                });
            }

            const result = await this.authService.autenticar(matricula, senha);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro de autenticação',
                    type: error.errorType
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao fazer login',
                error: error.message
            });
        }
    }

    async logout(req, res) {
        try {
            const { id } = req.body;

            if (!id) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    customMessage: 'ID do usuário é obrigatório'
                });
            }

            await this.authService.logout(id);
            return res.status(200).json({ message: 'Logout realizado com sucesso' });
        } catch (error) {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro ao fazer logout',
                    type: error.errorType
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao fazer logout',
                error: error.message
            });
        }
    }

    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    customMessage: 'Refresh token é obrigatório'
                });
            }

            const result = await this.authService.refreshToken(refreshToken);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro ao renovar token',
                    type: error.errorType
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao renovar token',
                error: error.message
            });
        }
    }

    async pass(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                throw new CustomError({
                    statusCode: 401,
                    errorType: 'authError',
                    customMessage: 'Token não fornecido'
                });
            }

            const result = await this.authService.verificarToken(token);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Token inválido',
                    type: error.errorType
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao verificar token',
                error: error.message
            });
        }
    }

    async recuperaSenha(req, res) {
        try {
            const { matricula } = req.body;

            if (!matricula) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    customMessage: 'Matrícula é obrigatória'
                });
            }

            await this.authService.enviarEmailRecuperacao(matricula);
            return res.status(200).json({
                message: 'Email de recuperação enviado com sucesso'
            });
        } catch (error) {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro ao solicitar recuperação de senha',
                    type: error.errorType
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao solicitar recuperação de senha',
                error: error.message
            });
        }
    }

    async atualizarSenhaToken(req, res) {
        try {
            const { token, novaSenha } = req.body;

            if (!token || !novaSenha) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    customMessage: 'Token e nova senha são obrigatórios'
                });
            }

            await this.authService.atualizarSenhaComToken(token, novaSenha);
            return res.status(200).json({ message: 'Senha atualizada com sucesso' });
        } catch (error) {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro ao atualizar senha',
                    type: error.errorType
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao atualizar senha',
                error: error.message
            });
        }
    }

    async atualizarSenhaCodigo(req, res) {
        try {
            const { matricula, codigo, novaSenha } = req.body;

            if (!matricula || !codigo || !novaSenha) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    customMessage: 'Matrícula, código e nova senha são obrigatórios'
                });
            }

            await this.authService.atualizarSenhaComCodigo(matricula, codigo, novaSenha);
            return res.status(200).json({ message: 'Senha atualizada com sucesso' });
        } catch (error) {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro ao atualizar senha',
                    type: error.errorType
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao atualizar senha',
                error: error.message
            });
        }
    }

    async revoke(req, res) {
        try {
            const { id } = req.body;

            if (!id) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    customMessage: 'ID do usuário é obrigatório'
                });
            }

            await this.authService.revogarTokens(id);
            return res.status(200).json({ message: 'Tokens revogados com sucesso' });
        } catch (error) {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro ao revogar tokens',
                    type: error.errorType
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao revogar tokens',
                error: error.message
            });
        }
    }
}

export default AuthController;
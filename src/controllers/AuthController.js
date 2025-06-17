import { AuthService } from "../services/AuthService.js";
import CommonResponse from "../utils/helpers/CommonResponse.js";
import HttpStatusCodes from "../utils/helpers/HttpStatusCodes.js";
import { UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js'

class AuthController {
    constructor() {
        this.service = new AuthService();
    }

    async login(req, res) {
        try {
            const { matricula, senha } = req.body;

            if (!matricula || !senha) {
                return res.status(400).json({
                    message: 'Matrícula e senha são obrigatórios',
                    type: 'validationError'
                });
            }

            const authData = await this.service.autenticar(matricula, senha);

            return res.status(200).json({
                message: 'Login realizado com sucesso',
                ...authData
            });
        } catch (error) {
            console.error('Erro ao realizar login:', error);

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro de autenticação',
                    type: error.errorType || 'authError'
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao tentar realizar login',
                type: 'serverError'
            });
        }
    }

    async logout(req, res) {
        try {
            const userId = req.userId; // Disponibilizado pelo middleware de autenticação

            await this.service.logout(userId);

            return res.status(200).json({
                message: 'Logout realizado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao realizar logout:', error);
            return res.status(500).json({
                message: 'Erro interno ao tentar realizar logout',
                type: 'serverError'
            });
        }
    }

    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    message: 'Token de atualização não fornecido',
                    type: 'validationError'
                });
            }

            const tokens = await this.service.refreshToken(refreshToken);

            return res.status(200).json({
                message: 'Token atualizado com sucesso',
                ...tokens
            });
        } catch (error) {
            console.error('Erro ao atualizar token:', error);

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro de autenticação',
                    type: error.errorType || 'authError'
                });
            }

            return res.status(500).json({
                message: 'Erro interno ao tentar atualizar token',
                type: 'serverError'
            });
        }
    }

    async revoke(req, res) {
        try {
            //verificação defensiva do body
            if (!req.body) {
                return res.status(400).json({
                    message: 'Corpo da requisição ausente',
                    type: 'validationError'
                });
            }

            const { matricula } = req.body;

            if (!matricula) {
                return res.status(400).json({
                    message: 'Matrícula não fornecida',
                    type: 'validationError'
                });
            }

            await this.service.revoke(matricula);

            return res.status(200).json({
                message: 'Token revogado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao revogar token:', error)

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    message: error.customMessage || 'Erro na revogação',
                    type: error.errorType || 'authError'
                });
            }
        }
        return res.status(500).json({
            message: 'Erro ao processar a revogação do token',
            type: 'serverError'
        });
    }

    async solicitarRecuperacaoSenha(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    message: 'Email é obrigatório',
                    type: 'validationError'
                });
            }

            const resultado = await this.service.recuperarSenha(email);

            return res.status(200).json(resultado);
        } catch (error) {
            console.error('Erro ao solicitar recuperação de senha:', error);
            return res.status(error.statusCode || 500).json({
                message: error.customMessage || 'Erro ao processar solicitação',
                type: error.errorType || 'serverError'
            });
        }
    }

    async redefinirSenhaComToken(req, res) {
        try {
            const { token } = req.query;
            const { senha } = req.body;

            if (!token || !senha) {
                return res.status(400).json({
                    message: 'Token e senha são obrigatórios',
                    type: 'validationError'
                });
            }

            const resultado = await this.service.redefinirSenhaComToken(token, senha);

            return res.status(200).json(resultado);
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return res.status(error.statusCode || 500).json({
                message: error.customMessage || 'Erro ao processar solicitação',
                type: error.errorType || 'serverError'
            });
        }
    }

    async redefinirSenhaComCodigo(req, res) {
        try {
            const { codigo, senha } = req.body;

            if (!codigo || !senha) {
                return res.status(400).json({
                    message: 'Código e senha são obrigatórios',
                    type: 'validationError'
                });
            }

            const resultado = await this.service.redefinirSenhaComCodigo(codigo, senha);

            return res.status(200).json(resultado);
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            return res.status(error.statusCode || 500).json({
                message: error.customMessage || 'Erro ao processar solicitação',
                type: error.errorType || 'serverError'
            });
        }
    }
}

export default new AuthController();
import { AuthService } from "../services/AuthService.js";

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
}

export default new AuthController();
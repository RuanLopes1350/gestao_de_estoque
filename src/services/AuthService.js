import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import UsuarioRepository from '../repositories/usuarioRepository.js';
import CustomError from '../utils/helpers/CustomError.js';

dotenv.config();

export class AuthService {
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
        this.ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
        this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret";
        this.ACCESS_TOKEN_EXPIRY = '1h';
        this.REFRESH_TOKEN_EXPIRY = '7d';
    }

    async autenticar(matricula, senha) {
        const usuario = await this.usuarioRepository.buscarPorMatricula(matricula, '+senha');

        if (!usuario) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Matrícula ou senha incorretos'
            });
        }

        if (!usuario.ativo) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Usuário inativo'
            });
        }

        // Verificar senha
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Matrícula ou senha incorretos'
            });
        }

        // Gerar tokens
        const accessToken = this._gerarAccessToken(usuario);
        const refreshToken = this._gerarRefreshToken(usuario);

        // Armazenar tokens no usuário
        await this.usuarioRepository.armazenarTokens(usuario._id, accessToken, refreshToken);

        // Retornar dados sem a senha
        const usuarioSemSenha = {
            id: usuario._id,
            nome_usuario: usuario.nome_usuario,
            email: usuario.email,
            matricula: usuario.matricula,
            perfil: usuario.perfil
        };

        return {
            usuario: usuarioSemSenha,
            accessToken,
            refreshToken
        };
    }

    async logout(userId) {
        return await this.usuarioRepository.removeToken(userId);
    }

    async refreshToken(refreshToken) {
        try {
            // Verificar se o token é válido
            const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);
            
            // Buscar usuário pelo ID
            const usuario = await this.usuarioRepository.buscarPorId(decoded.id);
            
            if (!usuario || usuario.refreshtoken !== refreshToken) {
                throw new CustomError({
                    statusCode: 401,
                    errorType: 'authError',
                    customMessage: 'Token de atualização inválido'
                });
            }
            
            // Gerar novos tokens
            const accessToken = this._gerarAccessToken(usuario);
            const newRefreshToken = this._gerarRefreshToken(usuario);
            
            // Armazenar novos tokens
            await this.usuarioRepository.armazenarTokens(usuario._id, accessToken, newRefreshToken);
            
            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Token de atualização inválido ou expirado'
            });
        }
    }

    _gerarAccessToken(usuario) {
        return jwt.sign(
            { 
                id: usuario._id, 
                matricula: usuario.matricula,
                perfil: usuario.perfil 
            },
            this.ACCESS_TOKEN_SECRET,
            { expiresIn: this.ACCESS_TOKEN_EXPIRY }
        );
    }

    _gerarRefreshToken(usuario) {
        return jwt.sign(
            { id: usuario._id },
            this.REFRESH_TOKEN_SECRET,
            { expiresIn: this.REFRESH_TOKEN_EXPIRY }
        );
    }
}
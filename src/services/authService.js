import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';
import UsuarioRepository from '../repositories/usuarioRepository.js';

class AuthService {
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
        this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'sua_chave_secreta_jwt';
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'sua_chave_secreta_refresh';
        this.accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION || '1h';
        this.refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
    }

    async login({matricula, senha}) {
        console.log('Estou no login em AuthService');

        const usuario = await this.usuarioRepository.buscarPorMatricula(matricula);
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Email',
                details: [],
                customMessage: 'Usuário não encontrado com esta matricula.'
            });
        }

         // Verificar se o usuário está ativo
         if (usuario.status === false) {
            throw new CustomError({
                statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                errorType: 'authorizationError',
                field: 'Usuario',
                details: [],
                customMessage: 'Este usuário está desativado. Contate o administrador.'
            });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            throw new CustomError({
                statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                errorType: 'authorizationError',
                field: 'Senha',
                details: [],
                customMessage: 'Credenciais inválidas. Verifique seu usuário e senha.'
            });
        }

        const accessToken = this.gerarAccessToken(usuario);
        const refreshToken = this.gerarRefreshToken(usuario);

        await this.usuarioRepository.atualizarTokens(usuario._id, accessToken, refreshToken);

        const usuarioSemSenha = { ...usuario.toObject() };
        delete usuarioSemSenha.senha;

        return {
            accessToken,
            refreshToken,
            user: usuarioSemSenha
        };
    }

    async logout(token) {
        console.log('Estou no logout em AuthService');
        
        // Verificar e invalidar o token
        try {
            const decodedToken = jwt.verify(token, this.accessTokenSecret);
            return await this.usuarioRepository.invalidarTokens(decodedToken.id);
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'token',
                details: [],
                customMessage: 'Token inválido.'
            });
        }
    }

    async refreshToken(refreshToken) {
        console.log('Estou no refreshToken em AuthService');
        
        try {
            // Verificar se o refresh token é válido
            const decodedToken = jwt.verify(refreshToken, this.refreshTokenSecret);
            const userId = decodedToken.id;

            // Buscar o usuário e verificar se o token armazenado coincide
            const usuario = await this.usuarioRepository.buscarUsuarioPorID(userId);
            
            if (!usuario || usuario.refreshToken !== refreshToken) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                    errorType: 'authorizationError',
                    field: 'refreshToken',
                    details: [],
                    customMessage: 'Refresh token inválido ou expirado.'
                });
            }

            // Verificar se o usuário está ativo
            if (usuario.status === false) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                    errorType: 'authorizationError',
                    field: 'Usuario',
                    details: [],
                    customMessage: 'Este usuário está desativado. Contate o administrador.'
                });
            }

            // Gerar novos tokens
            const newAccessToken = this.gerarAccessToken(usuario);
            const newRefreshToken = this.gerarRefreshToken(usuario);

            // Atualizar tokens no banco de dados
            await this.usuarioRepository.atualizarTokens(userId, newAccessToken, newRefreshToken);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new CustomError({
                    statusCode: 498,
                    errorType: 'tokenExpiredError',
                    field: 'refreshToken',
                    details: [],
                    customMessage: 'Refresh token expirado. Realize login novamente.'
                });
            }
            throw error;
        }
    }

    // Método auxiliar para gerar token de acesso
    gerarAccessToken(usuario) {
        return jwt.sign(
            { 
                id: usuario._id, 
                nome: usuario.nome_usuario,
                cargo: usuario.cargo 
            },
            this.accessTokenSecret,
            { expiresIn: this.accessTokenExpiration }
        );
    }

    gerarRefreshToken(usuario) {
        return jwt.sign(
            { id: usuario._id },
            this.refreshTokenSecret,
            { expiresIn: this.refreshTokenExpiration }
        );
    }
}

export default AuthService;
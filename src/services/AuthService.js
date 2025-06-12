import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomError, messages, HttpStatusCodes } from '../utils/helpers/index.js';
import TokenUtil from '../utils/TokenUtil.js'
import UsuarioRepository from '../repositories/usuarioRepository.js';

class AuthService {
    constructor({ tokenUtil, usuarioRepository } = {}) {
        this.TokenUtil = tokenUtil || new TokenUtil();
        this.usuarioRepository = usuarioRepository || new UsuarioRepository();
        this.repository = this; //Para manter compatibilidade com código existente
    }

    async login(body) {
        console.log('Estou no login em AuthService');

        //Buscar o usuário pelo matrícula
        const userEncontrado = await this.usuarioRepository.buscarUsuarioPorMatricula(body.matricula);

        if (!userEncontrado) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'unauthorized',
                field: 'Matrícula',
                details: [],
                customMessage: messages.error.unauthorized('Matrícula ou Senha')
            });
        }

        // Validar a senha
        const senhaValida = await bcrypt.compare(body.senha, userEncontrado.senha);
        if (!senhaValida) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'unauthorized',
                field: 'Senha',
                details: [],
                customMessage: messages.error.unauthorized('Matrícula ou Senha')
            });
        }

        //Gerar tokens
        const accessToken = await this.TokenUtil.generateAccessToken(userEncontrado._id);
        let refreshToken = userEncontrado.refreshToken;

        //Verificar se já existe um refresh token válido
        if (refreshToken) {
            try {
                jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN);
            } catch (error) {
                refreshToken = await this.TokenUtil.generateRefreshToken(userEncontrado._id);
            }
        } else {
            //Se não existe, gera um novo
            refreshToken = await this.TokenUtil.generateRefreshToken(userEncontrado._id);
        }

        //Armazenar os tokens
        await this.armazenarTokens(userEncontrado._id, accessToken, refreshToken);

        //Atualizar data do último login
        await this.usuarioRepository.atualizarUltimoLogin(userEncontrado._id);

        //Retornar usuário sem senha
        const userLimpo = userEncontrado.toObject();
        delete userLimpo.senha;

        return {
            user: userLimpo,
            accessToken,
            refreshToken
        };
    }

    async logout(id, token) {
        console.log('Estou no logout em AuthService');
        //Invalidar o token no banco
        await this.usuarioRepository.invalidarToken(id, token);
        return { data: { success: true } };
    }

    async revoke(id) {
        console.log('Estou no revoke em AuthService');
        // Remover todos os tokens do usuário
        await this.usuarioRepository.revogarTokens(id);
        return { message: 'Tokens revogados com sucesso' };
    }

    
}
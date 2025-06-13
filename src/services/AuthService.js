import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import UsuarioRepository from '../repositories/usuarioRepository.js';
import CustomError from '../utils/helpers/CustomError.js';
// import EmailService from './EmailService.js'; // Descomente se tiver um serviço de email

dotenv.config();

class AuthService {
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
        // this.emailService = new EmailService(); // Descomente se tiver um serviço de email
        this.accessTokenSecret = process.env.JWT_SECRET || 'secret_token';
        this.refreshTokenSecret = process.env.REFRESH_SECRET || 'secret_refresh';
        this.accessTokenExpiry = process.env.JWT_EXPIRATION || '1h';
        this.refreshTokenExpiry = process.env.REFRESH_EXPIRATION || '7d';
    }

    async autenticar(email, senha) {
        // Buscar usuário pelo email
        const usuario = await this.usuarioRepository.buscarPorEmail(email);
        
        if (!usuario) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Email ou senha inválidos'
            });
        }

        // Verificar se o usuário está ativo
        if (usuario.ativo === false) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Usuário inativo. Entre em contato com o administrador.'
            });
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Email ou senha inválidos'
            });
        }

        // Gerar tokens
        const accessToken = this._gerarAccessToken(usuario);
        const refreshToken = this._gerarRefreshToken(usuario);

        // Salvar tokens no banco de dados
        await this.usuarioRepository.armazenarTokens(usuario._id, accessToken, refreshToken);

        // Remover campos sensíveis
        const usuarioSemSenha = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            // Adicione outros campos conforme necessário
        };

        return {
            usuario: usuarioSemSenha,
            accessToken,
            refreshToken
        };
    }

    async logout(userId) {
        // Remover tokens do usuário no banco de dados
        await this.usuarioRepository.removeToken(userId);
        return true;
    }

    async refreshToken(refreshToken) {
        try {
            // Verificar se o token é válido
            const payload = jwt.verify(refreshToken, this.refreshTokenSecret);
            
            // Buscar usuário pelo ID
            const usuario = await this.usuarioRepository.buscarPorId(payload.id);
            
            if (!usuario) {
                throw new CustomError({
                    statusCode: 401,
                    errorType: 'authError',
                    customMessage: 'Usuário não encontrado'
                });
            }

            // Verificar se o refresh token está armazenado no banco
            if (usuario.refreshtoken !== refreshToken) {
                throw new CustomError({
                    statusCode: 401,
                    errorType: 'authError',
                    customMessage: 'Refresh token inválido'
                });
            }

            // Gerar novos tokens
            const newAccessToken = this._gerarAccessToken(usuario);
            const newRefreshToken = this._gerarRefreshToken(usuario);

            // Atualizar tokens no banco de dados
            await this.usuarioRepository.armazenarTokens(usuario._id, newAccessToken, newRefreshToken);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Token inválido ou expirado'
            });
        }
    }

    async verificarToken(token) {
        try {
            const payload = jwt.verify(token, this.accessTokenSecret);
            
            // Buscar usuário pelo ID
            const usuario = await this.usuarioRepository.buscarPorId(payload.id);
            
            if (!usuario) {
                throw new CustomError({
                    statusCode: 401,
                    errorType: 'authError',
                    customMessage: 'Usuário não encontrado'
                });
            }

            // Verificar se o token está armazenado no banco
            if (usuario.accesstoken !== token) {
                throw new CustomError({
                    statusCode: 401,
                    errorType: 'authError',
                    customMessage: 'Token inválido'
                });
            }

            return {
                valid: true,
                usuario: {
                    id: usuario._id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil
                }
            };
        } catch (error) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Token inválido ou expirado'
            });
        }
    }

    async enviarEmailRecuperacao(email) {
        // Buscar usuário pelo email
        const usuario = await this.usuarioRepository.buscarPorEmail(email);
        
        if (!usuario) {
            // Por segurança, não informamos se o email existe ou não
            return true;
        }

        // Gerar token de recuperação
        const token = this._gerarRecuperacaoToken(usuario);
        
        // Gerar código de recuperação (6 dígitos)
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Salvar token e código no usuário
        await this.usuarioRepository.atualizarTokenRecuperacao(usuario._id, token, codigo);

        // Enviar email com o link de recuperação e código
        // Descomente e adapte conforme necessário
        /*
        await this.emailService.enviarEmail({
            para: email,
            assunto: 'Recuperação de Senha',
            texto: `Seu código de recuperação é: ${codigo}. Ou use o link: ${process.env.FRONTEND_URL}/reset-password?token=${token}`
        });
        */
        
        return true;
    }

    async atualizarSenhaComToken(token, novaSenha) {
        try {
            // Verificar se o token é válido
            const payload = jwt.verify(token, this.accessTokenSecret);
            
            // Buscar usuário pelo ID
            const usuario = await this.usuarioRepository.buscarPorId(payload.id);
            
            if (!usuario || usuario.token_recuperacao !== token) {
                throw new CustomError({
                    statusCode: 401,
                    errorType: 'authError',
                    customMessage: 'Token inválido ou expirado'
                });
            }

            // Hash da nova senha
            const senhaHash = await bcrypt.hash(novaSenha, 10);
            
            // Atualizar senha e limpar token de recuperação
            await this.usuarioRepository.atualizarSenha(usuario._id, senhaHash);
            
            return true;
        } catch (error) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Token inválido ou expirado'
            });
        }
    }

    async atualizarSenhaComCodigo(email, codigo, novaSenha) {
        // Buscar usuário pelo email
        const usuario = await this.usuarioRepository.buscarPorEmail(email);
        
        if (!usuario || usuario.codigo_recuperacao !== codigo) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Email ou código inválido'
            });
        }

        // Hash da nova senha
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        
        // Atualizar senha e limpar código de recuperação
        await this.usuarioRepository.atualizarSenha(usuario._id, senhaHash);
        
        return true;
    }

    async revogarTokens(userId) {
        // Remover tokens do usuário no banco de dados
        await this.usuarioRepository.removeToken(userId);
        return true;
    }

    _gerarAccessToken(usuario) {
        const payload = {
            id: usuario._id,
            email: usuario.email,
            perfil: usuario.perfil,
            // Adicione outros campos conforme necessário
        };

        return jwt.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry
        });
    }

    _gerarRefreshToken(usuario) {
        const payload = {
            id: usuario._id,
            tokenId: uuidv4()
        };

        return jwt.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry
        });
    }

    _gerarRecuperacaoToken(usuario) {
        const payload = {
            id: usuario._id,
            tokenId: uuidv4()
        };

        return jwt.sign(payload, this.accessTokenSecret, {
            expiresIn: '1h' // Token de recuperação expira em 1 hora
        });
    }
}

export default AuthService;
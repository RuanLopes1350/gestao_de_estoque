import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UsuarioRepository from '../repositories/usuarioRepository.js';

dotenv.config();

const authMiddleware = async (req, res, next) => {
    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ['/login', '/recuperar-senha', '/docs', '/cadastro'];
    
    // Verifica se a rota atual está na lista de rotas públicas
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    // Verificar se o token está presente no header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Extrair o token do header (formato: "Bearer <token>")
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_token');
        
        // Buscar usuário no banco de dados
        const usuarioRepository = new UsuarioRepository();
        const usuario = await usuarioRepository.buscarPorId(decoded.id);
        
        if (!usuario) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        
        // Verificar se o token no banco corresponde ao token fornecido
        if (usuario.accesstoken !== token) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        // Adicionar o usuário ao objeto da requisição
        req.user = {
            id: usuario._id,
            email: usuario.email,
            perfil: usuario.perfil
        };
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};

export default authMiddleware;
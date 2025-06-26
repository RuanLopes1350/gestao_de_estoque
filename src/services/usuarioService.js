import UsuarioRepository from '../repositories/usuarioRepository.js';
import mongoose from 'mongoose';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';
import bcrypt from 'bcrypt';
import { UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository();
    }

    async listarUsuarios(req) {
        console.log('Estou no listarUsuarios em UsuarioService');
        const data = await this.repository.listarUsuarios(req);
        console.log('Estou retornando os dados em UsuarioService');
        return data;
    }

    async cadastrarUsuario(dadosUsuario) {
        console.log('Estou no cadastrarUsuario em UsuarioService');
        if (!dadosUsuario.data_cadastro) {
            dadosUsuario.data_cadastro = new Date();
        }

        dadosUsuario.data_ultima_atualizacao = new Date();

        const data = await this.criarUsuario(dadosUsuario);
        return data;
    }

    async atualizarUsuario(id, dadosAtualizacao) {
        console.log('Atualizando usuário:', id, dadosAtualizacao);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido.'
            });
        }

        dadosAtualizacao.data_ultima_atualizacao = new Date();
        const usuarioAtualizado = await this.repository.atualizarUsuario(id, dadosAtualizacao);
        return usuarioAtualizado;
    }

    async buscarUsuarioPorID(id) {
        console.log('Estou no buscarUsuarioPorID em UsuarioService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido.'
            });
        }

        const data = await this.repository.buscarUsuarioPorID(id);

        if (!data) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: 'Usuário não encontrado.'
            });
        }

        return data;
    }

    async buscarUsuarioPorMatricula(matricula) {
        console.log('Estou no buscarUsuarioPorMatricula em UsuarioService');

        if (!matricula || matricula.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula válida é obrigatória para busca.'
            });
        }

        const usuario = await this.repository.buscarUsuarioPorMatricula(matricula);

        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: 'Usuário não encontrado com a matrícula informada.'
            });
        }

        return usuario;
    }

    async deletarUsuario(id) {
        console.log('Estou no deletarUsuario em UsuarioService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido.'
            });
        }

        // Verificar se o usuário existe antes de tentar deletar
        await this.buscarUsuarioPorID(id);

        try {
            const data = await this.repository.deletarUsuario(id);
            return data;
        } catch (error) {
            throw error;
        }
    }
    

    async desativarUsuario(id) {
    console.log('Estou no desativarUsuario em UsuarioService');

    try {
        UsuarioIdSchema.parse(id);
    } catch (error) {
        throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'id',
            details: [],
            customMessage: 'ID do usuário inválido.'
        });
    }

        const data = await this.repository.desativarUsuario(id);
        return data;
    }

    async reativarUsuario(id) {
    console.log('Estou no reativarUsuario em UsuarioService'); 

    try {
        UsuarioIdSchema.parse(id);
    } catch (error) {
        throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'id',
            details: [],
            customMessage: 'ID do usuário inválido.'
        });
    }

        const data = await this.repository.reativarUsuario(id);
        return data;
    }

    async verificarEmailExistente(email) {
        const usuario = await this.repository.buscarPorEmail(email);
        return usuario !== null;
    }

    async criarUsuario(dadosUsuario) {
        // Se a senha não estiver hash, faça o hash
        if (dadosUsuario.senha && !dadosUsuario.senha.startsWith('$2')) {
            dadosUsuario.senha = await bcrypt.hash(dadosUsuario.senha, 10);
        }

        return await this.repository.criarUsuario(dadosUsuario);
    }

    async revoke(token) {
        if (!token) {
            throw new CustomError({
                statusCode: 400,
                customMessage: 'Token não fornecido',
                errorType: 'validationError'
            });
        }
        await this.repository.adicionarTokenRevogado(token);

        return true;
    }

    /**
     * Adiciona um usuário a um grupo
     * @param {String} usuarioId - ID do usuário
     * @param {String} grupoId - ID do grupo
     * @returns {Object} - Usuário atualizado
     */
    async adicionarUsuarioAoGrupo(usuarioId, grupoId) {
        try {
            const usuario = await this.repository.buscarPorId(usuarioId);
            if (!usuario) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'usuario',
                    details: [],
                    customMessage: 'Usuário não encontrado'
                });
            }

            // Verificar se o grupo existe
            const Grupo = mongoose.model('grupos');
            const grupo = await Grupo.findById(grupoId);
            if (!grupo) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'grupo',
                    details: [],
                    customMessage: 'Grupo não encontrado'
                });
            }

            // Verificar se o usuário já está no grupo
            if (usuario.grupos && usuario.grupos.includes(grupoId)) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'grupo',
                    details: [],
                    customMessage: 'Usuário já pertence a este grupo'
                });
            }

            // Adicionar o grupo ao usuário
            const gruposAtualizados = usuario.grupos ? [...usuario.grupos, grupoId] : [grupoId];
            
            return await this.repository.atualizarUsuario(usuarioId, {
                grupos: gruposAtualizados
            });
        } catch (error) {
            console.error('Erro ao adicionar usuário ao grupo:', error);
            throw error;
        }
    }

    /**
     * Remove um usuário de um grupo
     * @param {String} usuarioId - ID do usuário
     * @param {String} grupoId - ID do grupo
     * @returns {Object} - Usuário atualizado
     */
    async removerUsuarioDoGrupo(usuarioId, grupoId) {
        try {
            const usuario = await this.repository.buscarPorId(usuarioId);
            if (!usuario) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'usuario',
                    details: [],
                    customMessage: 'Usuário não encontrado'
                });
            }

            // Verificar se o usuário está no grupo
            if (!usuario.grupos || !usuario.grupos.includes(grupoId)) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'grupo',
                    details: [],
                    customMessage: 'Usuário não pertence a este grupo'
                });
            }

            // Remover o grupo do usuário
            const gruposAtualizados = usuario.grupos.filter(g => g.toString() !== grupoId);
            
            return await this.repository.atualizarUsuario(usuarioId, {
                grupos: gruposAtualizados
            });
        } catch (error) {
            console.error('Erro ao remover usuário do grupo:', error);
            throw error;
        }
    }

    /**
     * Adiciona uma permissão individual a um usuário
     * @param {String} usuarioId - ID do usuário
     * @param {Object} permissao - Dados da permissão
     * @returns {Object} - Usuário atualizado
     */
    async adicionarPermissaoAoUsuario(usuarioId, permissao) {
        try {
            const usuario = await this.repository.buscarPorId(usuarioId);
            if (!usuario) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'usuario',
                    details: [],
                    customMessage: 'Usuário não encontrado'
                });
            }

            // Verificar se a permissão já existe
            const permissaoExiste = usuario.permissoes && usuario.permissoes.some(p => 
                p.rota === permissao.rota.toLowerCase() && 
                p.dominio === (permissao.dominio || 'localhost')
            );

            if (permissaoExiste) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'permissao',
                    details: [],
                    customMessage: 'Esta permissão já existe para o usuário'
                });
            }

            // Adicionar a permissão
            const permissoesAtualizadas = usuario.permissoes ? [...usuario.permissoes] : [];
            permissoesAtualizadas.push({
                ...permissao,
                rota: permissao.rota.toLowerCase()
            });

            return await this.repository.atualizarUsuario(usuarioId, {
                permissoes: permissoesAtualizadas
            });
        } catch (error) {
            console.error('Erro ao adicionar permissão ao usuário:', error);
            throw error;
        }
    }

    /**
     * Remove uma permissão individual de um usuário
     * @param {String} usuarioId - ID do usuário
     * @param {String} rota - Nome da rota
     * @param {String} dominio - Domínio da aplicação
     * @returns {Object} - Usuário atualizado
     */
    async removerPermissaoDoUsuario(usuarioId, rota, dominio = 'localhost') {
        try {
            const usuario = await this.repository.buscarPorId(usuarioId);
            if (!usuario) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'usuario',
                    details: [],
                    customMessage: 'Usuário não encontrado'
                });
            }

            // Filtrar as permissões removendo a especificada
            const permissoesAtualizadas = usuario.permissoes ? 
                usuario.permissoes.filter(p => 
                    !(p.rota === rota.toLowerCase() && p.dominio === dominio)
                ) : [];

            if (permissoesAtualizadas.length === (usuario.permissoes?.length || 0)) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'permissao',
                    details: [],
                    customMessage: 'Permissão não encontrada para o usuário'
                });
            }

            return await this.repository.atualizarUsuario(usuarioId, {
                permissoes: permissoesAtualizadas
            });
        } catch (error) {
            console.error('Erro ao remover permissão do usuário:', error);
            throw error;
        }
    }

    /**
     * Obtém todas as permissões efetivas de um usuário (grupos + individuais)
     * @param {String} usuarioId - ID do usuário
     * @returns {Object} - Permissões do usuário
     */
    async obterPermissoesUsuario(usuarioId) {
        try {
            const PermissionService = (await import('./PermissionService.js')).default;
            const permissionService = new PermissionService();
            
            return await permissionService.getUserPermissions(usuarioId);
        } catch (error) {
            console.error('Erro ao obter permissões do usuário:', error);
            throw error;
        }
    }
}

export default UsuarioService;
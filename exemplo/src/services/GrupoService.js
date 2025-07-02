// src/services/GrupoService.js

import mongoose from 'mongoose';
import GrupoRepository from '../repositories/GrupoRepository.js';
import GrupoFilterBuilder from '../repositories/filters/GrupoFilterBuilder.js'; // Importação adicionada
import { CustomError, messages } from '../utils/helpers/index.js';
import { PermissoesArraySchema } from '../utils/validators/schemas/zod/PermissaoValidation.js';
import { GrupoQuerySchema, GrupoIdSchema } from '../utils/validators/schemas/zod/querys/GrupoQuerySchema.js';
import { GrupoSchema, GrupoUpdateSchema } from '../utils/validators/schemas/zod/GrupoSchema.js';

class GrupoService {
    constructor() {
        // Instancia o GrupoFilterBuilder
        const grupoFilterBuilder = new GrupoFilterBuilder();

        // Injeta o GrupoFilterBuilder no GrupoRepository
        this.repository = new GrupoRepository({
            grupoFilterBuilder
        });
    }

    /**
     * Validação nesta aplicação segue o seguinte artigo:
     * https://docs.google.com/document/d/1m2Ns1rIxpUzG5kRsgkbaQFdm7od0e7HSHfaSrrwegmM/edit?usp=sharing
     */

    /**
     * Lista grupos. Se um ID é fornecido, retorna um grupo.
     * Caso contrário, retorna todos os grupos com suporte a filtros e paginação.
     */
    async listar(req) {
        console.log('Estou no listar em GrupoService');
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em GrupoService');
        return data;
    }

    /**
     * Cria um novo grupo após validação dos dados.
     */
    async criar(parsedData) {
        console.log('Estou no criar em GrupoService');

        // Realiza validações compartilhadas
        await this.validateGroupName(parsedData.nome);
        // await this.validatePermissions(parsedData.permissoes);

        // Chama o repositório para criar o grupo
        const data = await this.repository.criar(parsedData);
        return data;
    }

    /**
     * Atualiza um grupo existente após validação dos dados.
     */
    async atualizar(parsedData, id) {
        console.log('Estou no atualizar em GrupoService');

        // Garante que o grupo exista
        await this.ensureGroupExists(id);

        // Realiza validações compartilhadas
        await this.validateGroupName(parsedData.nome, id);
        // await this.validatePermissions(parsedData.permissoes);

        // Chama o repositório para atualizar o grupo
        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    /**
     * Deleta um grupo existente.
     */
    async deletar(id) {
        console.log('Estou no deletar em GrupoService');

        // Verificar se o grupo existe
        await this.ensureGroupExists(id);

        // Verificar se o grupo está associado a algum usuário
        const usuariosAssociados = await this.repository.verificarUsuariosAssociados(id);

        if (usuariosAssociados) {
            throw new CustomError({
                statusCode: 409,
                errorType: 'resourceConflict',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.resourceConflict('Grupo', 'Usuários associados'),
            });
        }

        // Chamar o repositório para deletar o grupo
        return await this.repository.deletar(id);
    }

    //-------------------------------------------------------------------------------------------------
    /**
     * MÉTODOS AUXILIARES
     */

    /**
     * Valida a unicidade do nome do grupo.
     */
    async validateGroupName(nome, id = null) {
        const grupoExistente = await this.repository.buscarPorNome(nome, id);
        if (grupoExistente) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
        }
    }

    /**
     * Valida o array de permissões.
     */
    async validatePermissions(permissoes) {
        if (!permissoes) {
            return [];
        }

        if (permissoes.length > 0) {
            PermissoesArraySchema.parse(permissoes);
        }

        const permissoesExistentes = await this.repository.buscarPorPermissao(permissoes);
        if (permissoesExistentes.length !== permissoes.length) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'permissoes',
                details: [{ path: 'permissoes', message: 'Permissões inválidas.' }],
                customMessage: 'Permissões inválidas.',
            });
        }

        // Atualiza o array de permissões removendo as permissões inválidas
        return permissoesExistentes;
    }

    /**
     * Garante que o grupo existe.
     */
    async ensureGroupExists(id) {
        const grupoExistente = await this.repository.buscarPorId(id);
        if (!grupoExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.resourceNotFound('Grupo'),
            });
        }
    }
}

export default GrupoService;

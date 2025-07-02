// src/services/UnidadeService.js

import UnidadeRepository from '../repositories/UnidadeRepository.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes,
    errorHandler,
    messages,
    StatusService,
    asyncWrapper,
} from '../utils/helpers/index.js';
import { UnidadeQuerySchema, UnidadeIdSchema } from '../utils/validators/schemas/zod/querys/UnidadeQuerySchema.js';
import { UnidadeSchema, UnidadeUpdateSchema } from '../utils/validators/schemas/zod/UnidadeSchema.js';

class UnidadeService {
    constructor() {
        this.repository = new UnidadeRepository();
    }

    /**
     * Lista as unidades. Recebe um objeto _req_ (por exemplo, com query params)
     */
    async listar(req) {
        console.log('Estou no listar em UnidadeService');
        const data = await this.repository.listar(req);
        return data;
    }

    /**
     * Cria uma unidade, após verificar se já existe (nome + localidade) e validar os dados.
     */
    async criar(req) {
        console.log('Estou no criar em UnidadeService');

        // Verifica se já existe uma unidade com o mesmo nome e localidade
        const unidadeExistente = await this.repository.buscarPorNome(req.body.nome, req.body.localidade);
        if (unidadeExistente) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'nome',
                details: [],
                customMessage: messages.validation.generic.resourceAlreadyExists('Nome'),
            });
        }

        // Validação dos dados usando o schema do Zod
        const unidadeValidada = await UnidadeSchema.parseAsync(req.body);

        // Cria a unidade no repositório
        const data = await this.repository.criar(unidadeValidada);
        return data;
    }

    /**
     * Atualiza uma unidade com base no ID passado em req.params
     */
    async atualizar(req) {
        console.log('Estou no atualizar em UnidadeService');

        const id = req.params.id;

        // Se o ID não for informado, lança erro
        if (!id) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: messages.validation.generic.fieldIsRequired('ID'),
            });
        }

        // Inclui o id nos dados para validação
        const dadosAtualizacao = { ...req.body, id };

        // Validação dos dados de atualização
        const unidadeValida = await UnidadeUpdateSchema.parseAsync(dadosAtualizacao);

        // Atualiza a unidade no repositório
        const data = await this.repository.atualizar(id, unidadeValida);
        return data;
    }

    /**
     * Deleta uma unidade com base no ID.
     *
     * Antes de deletar, garante que:
     *   - A unidade existe.
     *   - Não há usuários associados.
     */
    async deletar(id) {
        console.log('Estou no deletar em UnidadeService');

        // Garante que a unidade existe (caso contrário, lança erro)
        await this.ensureUnitExists(id);

        // Verifica se a unidade (ou grupo) está associada a algum usuário
        const usuariosAssociados = await this.repository.verificarUsuariosAssociados(id);

        if (usuariosAssociados) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'resourceConflict',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.resourceConflict('Grupo', 'Usuários associados'),
            });
        }

        // Deleta a unidade
        const data = await this.repository.deletar(id);
        return data;
    }

    /**
     * Garante que a unidade existe; caso contrário, lança um erro.
     */
    async ensureUnitExists(id) {
        const unidadeExistente = await this.repository.buscarPorId(id);
        if (!unidadeExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Unidade',
                details: [],
                customMessage: messages.error.resourceNotFound('Unidade'),
            });
        }
    }
}

export default UnidadeService;

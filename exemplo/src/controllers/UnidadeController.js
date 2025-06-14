// src/controllers/UnidadeController.js

import UnidadeService from '../services/UnidadeService.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import { UnidadeQuerySchema, UnidadeIdSchema } from '../utils/validators/schemas/zod/querys/UnidadeQuerySchema.js';
import { UnidadeSchema, UnidadeUpdateSchema } from '../utils/validators/schemas/zod/UnidadeSchema.js';

class UnidadeController {
    constructor() {
        this.service = new UnidadeService();
    }

    /**
     * Validação nesta aplicação segue o segue este artigo:
     * https://docs.google.com/document/d/1m2Ns1rIxpUzG5kRsgkbaQFdm7od0e7HSHfaSrrwegmM/edit?usp=sharing
     */

    /**
     * Lista grupos. Se um ID é fornecido, retorna um único objeto.
     * Caso contrário, retorna todos os objetos com suporte a filtros e paginação.
     */

    async listar(req, res) {
        console.log('Estou no listar em UnidadeController, enviando req para UnidadeService');

        //1ª Validação estrutural - validação do ID passado por parâmetro
        const { id } = req.params || null;
        if (id) {
            UnidadeIdSchema.parse(id); // Lança erro automaticamente se inválido
        }

        // 2º Validação estrutural - validar os demais campos passados por query
        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            const validatedQuery = UnidadeQuerySchema.parse(req.query);
        }

        // Chama o serviço para listar as unidades
        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    /**
     * Criar uma nova unidade.
     */
    async criar(req, res) {
        console.log('Estou no criar em UnidadeController');

        // Validação dos dados de entrada usando Zod (estrutural)
        const parsedData = UnidadeSchema.parse(req.body);

        // Chama o serviço para criar a unidade
        const data = await this.service.criar(req);

        // Se chegou até aqui, é porque deu tudo certo, retornar 201 Created
        return CommonResponse.created(res, data);

    }

    /**
     * Atualiza uma unidade existente.
     */
    async atualizar(req, res) {
        console.log('Estou no atualizar em UnidadeController');

        //1ª Validação estrutural - validação do ID passado por parâmetro
        const { id } = req.params || null;
        if (id) {
            UnidadeIdSchema.parse(id); // Lança erro automaticamente se inválido
        }

        // Validação dos dados de entrada usando Zod (estrutural)
        const parsedData = UnidadeUpdateSchema.parse(req.body);

        // Chama o serviço para atualizar a unidade
        const data = await this.service.atualizar(req);

        // Se chegou até aqui, é porque deu tudo certo, retornar 200 OK
        return CommonResponse.success(res, data);
    }

    async deletar(req, res) {
        console.log('Estou no deletar em UnidadeController');

        // Validação estrutural - validação do ID passado por parâmetro
        const { id } = req.params || null;
        if (!id) {
            throw new CustomError('ID da unidade é obrigatório para deletar.', HttpStatusCodes.BAD_REQUEST);
        }

        // Chama o serviço para deletar a unidade
        const data = await this.service.deletar(id);

        // Se chegou até aqui, é porque deu tudo certo, retornar 200 OK
        return CommonResponse.success(res, data, 200, 'Unidade deletada com sucesso');
    }
}

export default UnidadeController;

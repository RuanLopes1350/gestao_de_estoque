// src/controllers/SupplierController.js

// TODO: imporar service
import SupplierService from '../services/SupplierService.js';
import { SupplierQuerySchema, SupplierIdSchema } from '../utils/validators/schemas/zod/querys/SupplierQuerySchema.js';
import { SupplierSchema, SupplierUpdateSchema } from '../utils/validators/schemas/zod/SupplierSchema.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes,
    errorHandler,
    messages,
    StatusService,
    asyncWrapper
} from '../utils/helpers/index.js';

class SupplierController {
    constructor() {
        this.service = new SupplierService(); // Injeção de dependência      
    }
    /**
     * Lista usuários. Se um ID é fornecido, retorna um único objeto.
     * Caso contrário, retorna todos os objetos com suporte a filtros e paginação.
     */
    async listar(req, res) {
        console.log('Estou no listar em SupplierController');

        // Validação do ID (se existir)
        const { id } = req.params || {};
        if (id) {
            SupplierIdSchema.parse(id);
        }

        // Validação das queries (se existirem)
        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            // deve apenas validar o objeto query, tendo erro o zod será responsável por lançar o erro
            await SupplierQuerySchema.parseAsync(query);
        }

        //TODO: const data = await this.service.listar(req);
        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    /**
     * Cria um novo usuário.
     */
    async criar(req, res) {
        console.log('Estou no criar em SupplierController');

        // Cria o DTO de criação e valida os dados
        const parsedData = SupplierSchema.parse(req.body);
        let data = await this.service.criar(req);

        // Converte o documento Mongoose para um objeto simples
        let supplierLimpo = data.toObject();

        return CommonResponse.created(res, supplierLimpo);
    }


    /**
     * Atualiza um usuário existente.
     */
    async atualizar(req, res) {
        console.log('Estou no atualizar em SupplierController');
        const { id } = req.params;
        SupplierIdSchema.parse(id);

        const parsedData = SupplierUpdateSchema.parse(req.body);

        const data = await this.service.atualizar(id, parsedData);

        // Converte o documento Mongoose para um objeto simples
        let supplierLimpo = data.toObject();

        // Remove campos indesejados, como a senha e outros que não devem ser expostos
        delete supplierLimpo.senha;

        return CommonResponse.success(res, data, 200, 'Usuário atualizado com sucesso. Porém, o e-mail é ignorado em tentativas de atualização, pois é opração proibida. IDs de Unidades e Grupos não cadastradas são ignoradas.');
    }

    /**
     * Deleta um usuário existente.
     */
    async deletar(req, res) {
        console.log('Estou no deletar em SupplierController');

        const { id } = req.params || {};
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório para deletar.'
            });
        }

        const data = await this.service.deletar(id);
        return CommonResponse.success(res, data, 200, 'Usuário excluído com sucesso.');
    }
}

export default SupplierController;

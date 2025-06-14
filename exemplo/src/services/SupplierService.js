// /src/services/SupplierService.js
import SupplierRepository from '../repositories/SupplierRepository.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes,
    errorHandler,
    messages,
    StatusService,
    asyncWrapper
} from '../utils/helpers/index.js';

class SupplierService {
    constructor() {
        this.repository = new SupplierRepository();
    }

    /**
     * Lista usuários. Se um objeto de request é fornecido (com query, por exemplo),
     * retorna os usuários conforme os filtros.
     */
    async listar(req) {
        console.log('Estou no listar em SupplierService');

        // TODO: const data = await this.repository.listar(req);
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em SupplierService');
        return data;
    }

    /**
     * Cria um novo usuário após validação dos dados.
     */
    async criar(parsedData) {
        console.log('Estou no criar em SupplierService');

        // Valida a unicidade do email
        await this.validateEmail(parsedData.email);
        // Valida unidade do CNPJ
        await this.validateCnpj(parsedData.cnpj);
        // Valida unidade do telefone
        await this.validateTelefone(parsedData.telefone);

        // Chama o repositório para criar o usuário
        const data = await this.repository.criar(parsedData);

        return data;
    }

    /**
     * Atualiza um usuário existente.
     * Atenção: É proibido alterar o email. No serviço o objeto sempre chegará sem, pois o controller impedirá.
     */
    async atualizar(id, parsedData) {
        console.log('Estou no atualizar em SupplierService');

        /**
          * REGRA DE NEGÓCIO
        */
        // Valida a unicidade do email, CNPJ e telefone, mas ignora o ID atual
        if (parsedData.email) {
            await this.validateEmail(parsedData.email, id);
        }
        if (parsedData.cnpj) {
            await this.validateCnpj(parsedData.cnpj, id);
        }
        if (parsedData.telefone) {
            await this.validateTelefone(parsedData.telefone, id);
        }

        // Garante que o usuário existe
        await this.ensureSupplierExists(id);

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    /**
     * Deleta um usuário existente.
     */
    async deletar(id) {
        console.log('Estou no deletar em SupplierService');

        // Garante que o usuário existe
        await this.ensureSupplierExists(id);

        /**
         * Deve checar se o fornecedor está sendo usado em algum lugar antes de deletar
         * Neste caso, não há checagem, pois o fornecedor não é usado em nenhum lugar.
         */

        const data = await this.repository.deletar(id);
        return data;
    }

    /**
     * Adiciona permissões a um usuário.
     */
    async adicionarPermissoes(req) {
        const parsedPermissoes = PermissoesArraySchema.parse(req.body.permissoes);
        const result = await this.repository.adicionarPermissoes(req.params.id, parsedPermissoes);
        return result;
    }

    /**
     * Remove uma permissão de um usuário.
     */
    async removerPermissao(supplierId, permissaoId) {
        const result = await this.repository.removerPermissao(supplierId, permissaoId);
        return result;
    }

    /**
     * Atualiza as permissões de um usuário.
     */
    async atualizarPermissoes(supplierId, permissoesData) {
        const parsedData = PermissoesArraySchema.parse(permissoesData);
        const result = await this.repository.atualizarPermissoes(supplierId, parsedData);
        return result;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // MÉTODOS AUXILIARES
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * Valida a unicidade do email.
     */
    async validateEmail(email, id = null) {
        const supplierExistente = await this.repository.buscarPorEmail(email, id);
        if (supplierExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'email',
                details: [{ path: 'email', message: 'Email já está em uso.' }],
                customMessage: 'Email já está em uso.',
            });
        }
    }

    /**
     * Valida o CNPJ.
     */
    async validateCnpj(cnpj, id = null) {
        const supplierExistente = await this.repository.buscarPorCnpj(cnpj, id);
        if (supplierExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'cnpj',
                details: [{ path: 'cnpj', message: 'CNPJ já está em uso.' }],
                customMessage: 'CNPJ já está em uso.',
            });
        }
    }

    /**
     * Valida o telefone.
     */

    async validateTelefone(telefone, id = null) {
        const supplierExistente = await this.repository.buscarPorTelefone(telefone, id);
        if (supplierExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'telefone',
                details: [{ path: 'telefone', message: 'Telefone já está em uso.' }],
                customMessage: 'Telefone já está em uso.',
            });
        }
    }


    /**
     * Valida o array de permissões.
     */
    async validatePermissions(permissoes) {
        // Se permissoes não for um array, define como array vazio
        if (!Array.isArray(permissoes)) {
            permissoes = [];
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

        return permissoesExistentes;
    }

    /**
     * Garante que o usuário existe.
     */
    async ensureSupplierExists(id) {
        const supplierExistente = await this.repository.buscarPorId(id);
        if (!supplierExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        }
        return supplierExistente;
    }
}

export default SupplierService;

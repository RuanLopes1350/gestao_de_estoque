// src/services/RotaService.js

import RotaRepository from '../repositories/RotaRepository.js';

class RotaService {
    constructor() {
        this.repository = new RotaRepository();
    }

    /**
     * Validação nesta aplicação segue o seguinte artigo:
     * https://docs.google.com/document/d/1m2Ns1rIxpUzG5kRsgkbaQFdm7od0e7HSHfaSrrwegmM/edit?usp=sharing
     */

    /**
     * Lista rotas. Se um ID é fornecido, retorna uma rota.
     * Caso contrário, retorna todas as rotas com suporte a filtros e paginação.
     */

    async listar(req) {
        console.log('Estou no listar em RotaService');
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em RotaService');
        return data;
    }

    async criar(req) {
        console.log('Estou no criar em RotaService');
        return await this.repository.criar(req);
    }


    async atualizar(parsedData, id) {
        console.log('Estou no atualizar em RotaService');

        // Garante que a rota exista
        await this.ensureRouteExists(id);

        // Chamada para atualizar a rotas
        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async deletar(req) {
        console.log('Estou no deletar em RotaService');
        return await deletar(this.repository.deletar.bind(this.repository), req);
    }

    /**
     * Garante que a rota exista.
     */
    async ensureRouteExists(id) {
        const data = await this.repository.buscarPorId(id);
        if (!data) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Rota',
                details: [],
                customMessage: messages.error.resourceNotFound('Rota'),
            });
        }
    }

}

export default RotaService;

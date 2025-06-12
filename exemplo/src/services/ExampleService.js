// src/services/ExampleService.js

import ExampleRepository from '../repositories/ExampleRepository.js';

class ExampleService {
    constructor() {
        this.repository = new ExampleRepository();
    }

    async listar(req) {
        console.log('Estou no listar em ExampleService');
        const data = await this.repository.listar(req);
        return data;
    }

    async criar(dados) {
        return await this.repository.criar(dados);
    }

    async atualizar(id, dados) {
        return await this.repository.atualizar(id, dados);
    }

    async deletar(id) {
        return await this.repository.deletar(id);
    }
}

export default ExampleService;

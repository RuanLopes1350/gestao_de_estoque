// src/services/CursoService.js

import CursoRepository from '../repositories/CursoRepository.js';

class CursoService {
    constructor() {
        this.repository = new CursoRepository();
    }

    async listar(req) {
        console.log('Estou no listar em CursoService');
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

export default CursoService;

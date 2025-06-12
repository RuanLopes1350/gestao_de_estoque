// src/services/TurmaService.js

import TurmaRepository from '../repositories/TurmaRepository.js';

class TurmaService {
  constructor() {
    this.repository = new TurmaRepository();
  }

  // GET /turmas ou /turmas/:id
  async listar(req) {
    console.log('Estou no listar em TurmaService');
    const data = await this.repository.listar(req);
    return data;
  }

  // POST /turmas
  async criar(dados) {
    console.log('Estou no criar em TurmaService');
    const data = await this.repository.criar(dados);
    return data;
  }

  // GET /turmas/:id
  async buscarPorId(id) {
    console.log('Estou no buscarPorId em TurmaService');
    const data = await this.repository.buscarPorId(id);
    return data;
  }

  // PUT /turmas/:id
  async atualizar(id, dados) {
    console.log('Estou no atualizar em TurmaService');
    const data = await this.repository.atualizar(id, dados);
    return data;
  }

  // DELETE /turmas/:id
  async deletar(id) {
    console.log('Estou no deletar em TurmaService');
    const data = await this.repository.deletar(id);
    return data;
  }
}

export default TurmaService;

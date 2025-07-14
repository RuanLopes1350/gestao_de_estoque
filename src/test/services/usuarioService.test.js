import mongoose from 'mongoose';
jest.mock('mongoose', () => ({
  model: jest.fn(() => ({
    findById: jest.fn(),
    findOne: jest.fn()
  })),
  Types: { ObjectId: { isValid: jest.fn(() => true) } }
}));
import bcrypt from 'bcrypt';
jest.mock('bcrypt');
jest.mock('../../repositories/usuarioRepository.js');
import UsuarioRepository from '../../repositories/usuarioRepository.js';
import UsuarioService from '../../services/usuarioService.js';

describe('UsuarioService', () => {
  let service;
  let repositoryMock;

  beforeEach(() => {
    repositoryMock = new UsuarioRepository();
    service = new UsuarioService();
    service.repository = repositoryMock;
    jest.clearAllMocks();
  });

  it('deve listar usuários', async () => {
    repositoryMock.listarUsuarios.mockResolvedValue(['user1', 'user2']);
    const result = await service.listarUsuarios({});
    expect(result).toEqual(['user1', 'user2']);
    expect(repositoryMock.listarUsuarios).toHaveBeenCalled();
  });

  it('deve cadastrar usuário com datas preenchidas', async () => {
    repositoryMock.criarUsuario.mockResolvedValue({ _id: '1', nome: 'Teste' });
    const result = await service.cadastrarUsuario({ nome: 'Teste', senha: '123' });
    expect(result).toHaveProperty('_id');
    expect(repositoryMock.criarUsuario).toHaveBeenCalled();
  });

  it('deve atualizar usuário', async () => {
    repositoryMock.atualizarUsuario.mockResolvedValue({ _id: '1', nome: 'Atualizado' });
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    const result = await service.atualizarUsuario('1', { nome: 'Atualizado' });
    expect(result).toHaveProperty('nome', 'Atualizado');
    expect(repositoryMock.atualizarUsuario).toHaveBeenCalled();
  });

  it('deve buscar usuário por ID', async () => {
    repositoryMock.buscarPorId.mockResolvedValue({ _id: '1', nome: 'Teste' });
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    const result = await service.buscarUsuarioPorID('1');
    expect(result).toHaveProperty('_id', '1');
    expect(repositoryMock.buscarPorId).toHaveBeenCalled();
  });

  it('deve deletar usuário', async () => {
    repositoryMock.deletarUsuario.mockResolvedValue({ deleted: true });
    const result = await service.deletarUsuario('matricula1');
    expect(result).toHaveProperty('deleted', true);
    expect(repositoryMock.deletarUsuario).toHaveBeenCalled();
  });

  it('deve desativar usuário', async () => {
    repositoryMock.desativarUsuario.mockResolvedValue({ desativado: true });
    const result = await service.desativarUsuario('id1');
    expect(result).toHaveProperty('desativado', true);
    expect(repositoryMock.desativarUsuario).toHaveBeenCalled();
  });

  it('deve reativar usuário', async () => {
    repositoryMock.reativarUsuario.mockResolvedValue({ ativo: true });
    const result = await service.reativarUsuario('id1');
    expect(result).toHaveProperty('ativo', true);
    expect(repositoryMock.reativarUsuario).toHaveBeenCalled();
  });

  it('deve verificar email existente', async () => {
    repositoryMock.buscarPorEmail.mockResolvedValue({ email: 'a@a.com' });
    const result = await service.verificarEmailExistente('a@a.com');
    expect(result).toBe(true);
    expect(repositoryMock.buscarPorEmail).toHaveBeenCalled();
  });

  it('deve retornar false se email não existe', async () => {
    repositoryMock.buscarPorEmail.mockResolvedValue(null);
    const result = await service.verificarEmailExistente('b@b.com');
    expect(result).toBe(false);
  });

  it('deve revogar token', async () => {
    repositoryMock.adicionarTokenRevogado.mockResolvedValue(true);
    const result = await service.revoke('token123');
    expect(result).toBe(true);
    expect(repositoryMock.adicionarTokenRevogado).toHaveBeenCalledWith('token123');
  });
});

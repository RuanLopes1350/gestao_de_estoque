import UsuarioRepository from '../../repositories/usuarioRepository.js';
import Usuario from '../../models/Usuario.js';
import mongoose from 'mongoose';

jest.mock('../../models/Usuario.js');

const mockUser = {
  _id: '1',
  nome_usuario: 'Teste',
  matricula: '123',
  email: 'teste@teste.com',
  senha: 'senha',
  ativo: true,
  online: false
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UsuarioRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new UsuarioRepository({ model: Usuario });
  });

  it('listarUsuarios deve buscar por id', async () => {
    Usuario.findById.mockResolvedValue(mockUser);
    const req = { params: { id: '1' }, query: {} };
    const result = await repository.listarUsuarios(req);
    expect(result).toEqual(mockUser);
    expect(Usuario.findById).toHaveBeenCalledWith('1');
  });

  it('listarUsuarios deve buscar por filtros', async () => {
    Usuario.paginate = jest.fn().mockResolvedValue({ docs: [mockUser] });
    const req = { query: { nome_usuario: 'Teste', page: 1, limite: 10 } };
    const result = await repository.listarUsuarios(req);
    expect(result.docs[0]).toEqual(mockUser);
    expect(Usuario.paginate).toHaveBeenCalled();
  });

  it('buscarPorId deve retornar usuário', async () => {
    Usuario.findById.mockResolvedValue(mockUser);
    const result = await repository.buscarPorId('1');
    expect(result).toEqual(mockUser);
    expect(Usuario.findById).toHaveBeenCalledWith('1', { accesstoken: 0, refreshtoken: 0 });
  });

  it('buscarPorMatricula deve retornar usuário', async () => {
    Usuario.findOne.mockResolvedValue(mockUser);
    const result = await repository.buscarPorMatricula('123');
    expect(result).toEqual(mockUser);
    expect(Usuario.findOne).toHaveBeenCalledWith({ matricula: '123' });
  });
/*
  it('cadastrarUsuario deve criar novo usuário', async () => {
    Usuario.create.mockResolvedValue(mockUser);
    const result = await repository.cadastrarUsuario(mockUser);
    expect(result).toEqual(mockUser);
    expect(Usuario.create).toHaveBeenCalledWith(mockUser);
  });

  it('atualizarUsuario deve atualizar usuário', async () => {
    mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
    Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);
    const result = await repository.atualizarUsuario('1', { nome_usuario: 'Novo' });
    expect(result).toEqual(mockUser);
    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith('1', { nome_usuario: 'Novo' }, { new: true, runValidators: true });
  });

  it('deletarUsuario deve deletar usuário', async () => {
    Usuario.findOneAndDelete.mockResolvedValue(mockUser);
    const result = await repository.deletarUsuario('123');
    expect(result).toEqual(mockUser);
    expect(Usuario.findOneAndDelete).toHaveBeenCalledWith({ matricula: '123' });
  });
*/
  it('desativarUsuario deve desativar usuário', async () => {
    Usuario.findByIdAndUpdate.mockResolvedValue({ ...mockUser, ativo: false });
    const result = await repository.desativarUsuario('1');
    expect(result.ativo).toBe(false);
    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith('1', { ativo: false }, { new: true });
  });

  it('reativarUsuario deve reativar usuário', async () => {
    Usuario.findByIdAndUpdate.mockResolvedValue({ ...mockUser, ativo: true });
    const result = await repository.reativarUsuario('1');
    expect(result.ativo).toBe(true);
    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith('1', { ativo: true }, { new: true });
  });

  it('buscarPorEmail deve buscar usuário por email', async () => {
    Usuario.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const result = await repository.buscarPorEmail('teste@teste.com');
    expect(result).toEqual(mockUser);
  });

  it('setUserOnlineStatus deve atualizar status online', async () => {
    Usuario.findByIdAndUpdate.mockResolvedValue({ ...mockUser, online: true });
    const result = await repository.setUserOnlineStatus('1', true);
    expect(result.online).toBe(true);
    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith('1', { online: true }, { new: true });
  });

  it('getOnlineUsers deve retornar usuários online', async () => {
    Usuario.find.mockReturnValue({ select: jest.fn().mockResolvedValue([mockUser]) });
    const result = await repository.getOnlineUsers();
    expect(result[0]).toEqual(mockUser);
  });
});

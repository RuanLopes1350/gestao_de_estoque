// AuthRepository.test.js
import mongoose from 'mongoose';
import AuthRepository from '../../../repositories/AuthRepository.js';
import UsuarioModel from '../../../models/Usuario.js';
import { CustomError, messages } from '../../../utils/helpers/index.js';

// Mockando o modelo de Usuário
jest.mock('../../../models/Usuario.js');

describe('AuthRepository', () => {
  let authRepository;

  beforeEach(() => {
    authRepository = new AuthRepository();
    jest.clearAllMocks(); // Limpa os mocks antes de cada teste
  });

  describe('armazenarTokens', () => {
    it('deve armazenar accesstoken e refreshtoken no banco de dados', async () => {
      const id = new mongoose.Types.ObjectId();
      const accesstoken = 'accesstoken';
      const refreshtoken = 'refreshtoken';
      const documento = {
        save: jest.fn().mockResolvedValue({ accesstoken: accesstoken, refreshtoken: refreshtoken }),
      };

      // Configurando o mock para retornar o documento diretamente quando findById for chamado com o id específico
      UsuarioModel.findById.mockResolvedValue(documento);

      const result = await authRepository.armazenarTokens(id, accesstoken, refreshtoken);

      expect(result.accesstoken).toBe(accesstoken);
      expect(result.refreshtoken).toBe(refreshtoken);
      expect(UsuarioModel.findById).toHaveBeenCalledWith(id);
      expect(documento.save).toHaveBeenCalled();
    });

    it('deve lançar um CustomError se o usuário não for encontrado', async () => {
      const id = new mongoose.Types.ObjectId();
      UsuarioModel.findById.mockResolvedValue(null);

      await expect(authRepository.armazenarTokens(id, 'accesstoken', 'refreshtoken')).rejects.toMatchObject({
        name: 'CustomError',
        statusCode: 404,
        customMessage: messages.error.resourceNotFound('Usuário'),
      });

      expect(UsuarioModel.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('removeToken', () => {
    it('deve remover accesstoken e refreshtoken do usuário', async () => {
      const id = new mongoose.Types.ObjectId();
      const updatedUser = { accesstoken: null, refreshtoken: null };

      // Configurando o mock para retornar o usuário atualizado com exec()
      UsuarioModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await authRepository.removeToken(id);

      expect(result.accesstoken).toBeNull();
      expect(result.refreshtoken).toBeNull();
      expect(UsuarioModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { accesstoken: null, refreshtoken: null },
        { new: true }
      );
    });

    it('deve lançar um CustomError se o usuário não for encontrado', async () => {
      const id = new mongoose.Types.ObjectId();
      UsuarioModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(authRepository.removeToken(id)).rejects.toMatchObject({
        name: 'CustomError',
        statusCode: 404,
        customMessage: messages.error.resourceNotFound('Usuário'),
      });

      expect(UsuarioModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { accesstoken: null, refreshtoken: null },
        { new: true }
      );
    });
  });
});

// Mocks das dependências
jest.mock('../../services/LogService.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    registrarLog: jest.fn(),
  })),
}));

jest.mock('../../services/usuarioService.js');
jest.mock('../../utils/validators/schemas/zod/UsuarioSchema.js', () => ({
  UsuarioSchema: { parse: jest.fn() },
  UsuarioUpdateSchema: { parseAsync: jest.fn() }
}));
jest.mock('../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js', () => ({
  UsuarioQuerySchema: { parseAsync: jest.fn() },
  UsuarioIdSchema: { parse: jest.fn() },
  UsuarioMatriculaSchema: { parse: jest.fn() }
}));
jest.mock('../../utils/helpers/index.js', () => {
  const original = jest.requireActual('../../utils/helpers/index.js');
  return {
    ...original,
    CommonResponse: {
      success: jest.fn(),
      error: jest.fn(),
      created: jest.fn()
    },
    CustomError: jest.fn(opts => {
      const err = new Error(opts.customMessage || 'Erro');
      return Object.assign(err, opts);
    }),
    HttpStatusCodes: {
      OK: { code: 200 },
      CREATED: { code: 201 },
      BAD_REQUEST: { code: 400 },
      NOT_FOUND: { code: 404 }
    }
  };
});

import UsuarioController from '../../controllers/UsuarioController.js';
import UsuarioService from '../../services/usuarioService.js';
import { CommonResponse, HttpStatusCodes } from '../../utils/helpers/index.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../../utils/validators/schemas/zod/UsuarioSchema.js';
import { UsuarioQuerySchema, UsuarioIdSchema, UsuarioMatriculaSchema } from '../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import mongoose from 'mongoose';

describe('UsuarioController', () => {
  let usuarioController;
  let mockService;
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      listarUsuarios: jest.fn(),
      buscarUsuarioPorID: jest.fn(),
      buscarUsuarioPorMatricula: jest.fn(),
      cadastrarUsuario: jest.fn(),
      atualizarUsuario: jest.fn(),
      deletarUsuario: jest.fn(),
      desativarUsuario: jest.fn(),
      reativarUsuario: jest.fn()
    };

    UsuarioService.mockImplementation(() => mockService);
    usuarioController = new UsuarioController();

    req = {
      params: {},
      query: {},
      body: {},
      userId: 'admin123',
      userMatricula: 'ADM001'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('listarUsuarios', () => {
    it('deve retornar usuários com sucesso', async () => {
      const mockUsuarios = { docs: [{ nome: 'Fulano' }], totalDocs: 1 };
      mockService.listarUsuarios.mockResolvedValue(mockUsuarios);

      await usuarioController.listarUsuarios(req, res);

      expect(mockService.listarUsuarios).toHaveBeenCalledWith(req);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, mockUsuarios);
    });

    it('deve retornar erro se nenhum usuário for encontrado', async () => {
      mockService.listarUsuarios.mockResolvedValue({ docs: [] });

      await usuarioController.listarUsuarios(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        404,
        'resourceNotFound',
        'Usuario',
        [],
        'Nenhum usuário encontrado com os critérios informados.'
      );
    });

    it('deve validar query se fornecida', async () => {
      req.query = { nome: 'Teste' };
      mockService.listarUsuarios.mockResolvedValue({ docs: [{ nome: 'Fulano' }], totalDocs: 1 });
      await usuarioController.listarUsuarios(req, res);
      expect(UsuarioQuerySchema.parseAsync).toHaveBeenCalledWith(req.query);
    });

    it('deve tratar erros', async () => {
      const err = new Error('Falha inesperada');
      mockService.listarUsuarios.mockRejectedValue(err);
      await expect(usuarioController.listarUsuarios(req, res)).rejects.toThrow();
    });
  });

  describe('buscarUsuarioPorID', () => {
    it('deve retornar usuário por ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      req.params = { id: fakeId };
      const usuario = { _id: fakeId, nome: 'Fulano' };
      mockService.buscarUsuarioPorID.mockResolvedValue(usuario);

      await usuarioController.buscarUsuarioPorID(req, res);

      expect(UsuarioIdSchema.parse).toHaveBeenCalledWith(fakeId);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, usuario, 200, 'Usuário encontrado com sucesso.');
    });

    it('deve tratar erro se usuário não for encontrado', async () => {
      req.params = { id: '123' };
      const err = new Error('Não encontrado');
      mockService.buscarUsuarioPorID.mockRejectedValue(err);
      await expect(usuarioController.buscarUsuarioPorID(req, res)).rejects.toThrow();
    });
  });

  describe('buscarUsuarioPorMatricula', () => {
    it('deve retornar usuário por matrícula', async () => {
      req.params = { matricula: 'MAT123' };
      const usuario = { matricula: 'MAT123', nome: 'Fulano' };
      mockService.buscarUsuarioPorMatricula.mockResolvedValue(usuario);

      await usuarioController.buscarUsuarioPorMatricula(req, res);

      expect(CommonResponse.success).toHaveBeenCalledWith(res, usuario, 200, 'Usuário encontrado com sucesso.');
    });

    it('deve retornar erro se matrícula não for passada', async () => {
      req.params = {};
      await expect(usuarioController.buscarUsuarioPorMatricula(req, res)).rejects.toThrow();
    });
  });

  describe('cadastrarUsuario', () => {
    it('deve cadastrar usuário com senha', async () => {
      req.body = {
        nome: 'Novo Usuário',
        email: 'teste@email.com',
        senha: '123456',
        perfil: 'admin'
      };
      UsuarioSchema.parse.mockReturnValue(req.body);

      const mockUsuario = { ...req.body, _id: 'id123' };
      mockService.cadastrarUsuario.mockResolvedValue(mockUsuario);

      await usuarioController.cadastrarUsuario(req, res);

      expect(UsuarioSchema.parse).toHaveBeenCalledWith(req.body);
      expect(CommonResponse.created).toHaveBeenCalledWith(
        res,
        mockUsuario,
        HttpStatusCodes.CREATED.code,
        'Usuário cadastrado com sucesso.'
      );
    });

    it('deve tratar erro de validação', async () => {
      const error = new Error('Validação falhou');
      UsuarioSchema.parse.mockImplementation(() => { throw error; });
      await expect(usuarioController.cadastrarUsuario(req, res)).rejects.toThrow();
    });
  });

  describe('atualizarUsuario', () => {
    it('deve atualizar usuário com sucesso', async () => {
      req.params = { id: '123' };
      req.body = { nome: 'Atualizado' };

      UsuarioIdSchema.parse.mockReturnValue('123');
      UsuarioUpdateSchema.parseAsync.mockResolvedValue(req.body);

      const usuarioAtualizado = { _id: '123', nome: 'Atualizado' };
      mockService.atualizarUsuario.mockResolvedValue(usuarioAtualizado);

      await usuarioController.atualizarUsuario(req, res);

      expect(CommonResponse.success).toHaveBeenCalledWith(res, usuarioAtualizado, 200, 'Usuário atualizado com sucesso.');
    });

    it('deve retornar erro se ID não for fornecido', async () => {
      req.params = {};
      await expect(usuarioController.atualizarUsuario(req, res)).rejects.toThrow();
    });
  });
/*
  describe('deletarUsuario', () => {
    it('deve deletar usuário com sucesso', async () => {
      req.params = { matricula: 'MAT001' };
      const usuarioDeletado = { nome: 'Fulano', matricula: 'MAT001' };
      mockService.deletarUsuario.mockResolvedValue(usuarioDeletado);

      await usuarioController.deletarUsuario(req, res);

      expect(CommonResponse.success).toHaveBeenCalledWith(res, usuarioDeletado, 200, 'Usuário excluído com sucesso.');
    });

    it('deve lançar erro se matrícula não for passada', async () => {
      req.params = {};
      await usuarioController.deletarUsuario(req, res);
      expect(CommonResponse.error).toHaveBeenCalled();
    });
  });
*/
  describe('desativarUsuario', () => {
    it('deve desativar usuário com sucesso', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      req.params = { id: fakeId };
      UsuarioIdSchema.parse.mockReturnValue(fakeId);

      const usuarioDesativado = { _id: fakeId, ativo: false };
      mockService.desativarUsuario.mockResolvedValue(usuarioDesativado);

      await usuarioController.desativarUsuario(req, res);

      expect(CommonResponse.success).toHaveBeenCalledWith(res, usuarioDesativado, 200, 'Usuario desativado com sucesso.');
    });
  });

  describe('reativarUsuario', () => {
    it('deve reativar usuário com sucesso', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      req.params = { id: fakeId };
      UsuarioIdSchema.parse.mockReturnValue(fakeId);

      const usuarioReativado = { _id: fakeId, ativo: true };
      mockService.reativarUsuario.mockResolvedValue(usuarioReativado);

      await usuarioController.reativarUsuario(req, res);

      expect(CommonResponse.success).toHaveBeenCalledWith(res, usuarioReativado, 200, 'Usuario reativado com sucesso.');
    });
  });
});

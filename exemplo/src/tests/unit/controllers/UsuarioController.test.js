import UsuarioController from '../../../controllers/UsuarioController.js';
import UsuarioService from '../../../services/UsuarioService.js';
import { UsuarioQuerySchema, UsuarioIdSchema } from '../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../../../utils/validators/schemas/zod/UsuarioSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../../../utils/helpers/index.js';

jest.mock('../../../services/UsuarioService.js');

describe('UsuarioController', () => {
  let controller;
  let req;
  let res;
  let next;
  let serviceStub;

  beforeEach(() => {
    // Create a new controller instance and override its service with a stub.
    controller = new UsuarioController();
    serviceStub = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      processarFoto: jest.fn()
    };
    controller.service = serviceStub;

    req = { params: {}, query: {}, body: {}, files: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      sendFile: jest.fn()
    };
    next = jest.fn();
  });

  describe('listar', () => {
    it('deve chamar service.listar e retornar sucesso', async () => {
      const fakeData = { users: ['user1', 'user2'] };
      serviceStub.listar.mockResolvedValue(fakeData);
      req.params = {};
      req.query = {};

      // Spy on CommonResponse.success
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data) => {
        res.status(200).json(data);
      });

      // Ensure parse is not called when no id
      const idSpy = jest.spyOn(UsuarioIdSchema, 'parse');

      await controller.listar(req, res);
      expect(idSpy).not.toHaveBeenCalled();
      expect(serviceStub.listar).toHaveBeenCalledWith(req);
      expect(successSpy).toHaveBeenCalledWith(res, fakeData);

      successSpy.mockRestore();
      idSpy.mockRestore();
    });

    it('deve validar o id quando fornecido', async () => {
      const fakeData = { user: 'user1' };
      serviceStub.listar.mockResolvedValue(fakeData);
      req.params = { id: '123' };

      // Stub parse to avoid throwing
      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data) => {
        res.status(200).json(data);
      });

      await controller.listar(req, res);
      expect(idParseSpy).toHaveBeenCalledWith('123');

      idParseSpy.mockRestore();
      successSpy.mockRestore();
    });
  });

  describe('criar', () => {
    it('deve analisar o corpo da requisição, criar o usuário e retornar resposta de “created”', async () => {
      const fakeUserData = { nome: 'Test', senha: 'secret', toObject() { return { nome: 'Test', senha: 'secret' } } };
      serviceStub.criar.mockResolvedValue(fakeUserData);
      req.body = { nome: 'Test', senha: 'secret' };

      const schemaParseSpy = jest.spyOn(UsuarioSchema, 'parse').mockReturnValue(req.body);
      const createdSpy = jest.spyOn(CommonResponse, 'created').mockImplementation((res, data) => {
        res.status(201).json(data);
      });

      await controller.criar(req, res);
      expect(schemaParseSpy).toHaveBeenCalledWith(req.body);
      expect(serviceStub.criar).toHaveBeenCalledWith(req.body);
      // Ensure the password was removed
      const returnedData = fakeUserData.toObject();
      delete returnedData.senha;
      expect(createdSpy).toHaveBeenCalledWith(res, returnedData);

      schemaParseSpy.mockRestore();
      createdSpy.mockRestore();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar o usuário e retornar resposta de sucesso', async () => {
      const fakeUpdatedData = { nome: 'Updated', senha: 'secret', toObject() { return { nome: 'Updated', senha: 'secret' } } };
      serviceStub.atualizar.mockResolvedValue(fakeUpdatedData);
      req.params = { id: '123' };
      req.body = { nome: 'Updated' };

      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});
      const updateSchemaSpy = jest.spyOn(UsuarioUpdateSchema, 'parse').mockReturnValue(req.body);
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data, code, msg) => {
        res.status(code).json({ data, message: msg });
      });

      await controller.atualizar(req, res);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(updateSchemaSpy).toHaveBeenCalledWith(req.body);
      expect(serviceStub.atualizar).toHaveBeenCalledWith('123', req.body);

      const returnedData = fakeUpdatedData.toObject();
      delete returnedData.senha;
      expect(successSpy).toHaveBeenCalledWith(
        res,
        returnedData,
        200,
        expect.stringContaining('Usuário atualizado com sucesso')
      );

      idParseSpy.mockRestore();
      updateSchemaSpy.mockRestore();
      successSpy.mockRestore();
    });
  });

  describe('deletar', () => {
    it('deve excluir o usuário e retornar resposta de sucesso', async () => {
      const fakeDeletedData = { success: true };
      serviceStub.deletar.mockResolvedValue(fakeDeletedData);
      req.params = { id: '123' };

      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data, code, msg) => {
        res.status(code).json({ data, message: msg });
      });

      await controller.deletar(req, res);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.deletar).toHaveBeenCalledWith('123');
      expect(successSpy).toHaveBeenCalledWith(res, fakeDeletedData, 200, expect.stringContaining('excluído'));

      idParseSpy.mockRestore();
      successSpy.mockRestore();
    });
  });

  describe('fotoUpload', () => {
    it('deve processar o upload da foto e retornar resposta de sucesso', async () => {
      req.params = { id: '123' };
      req.files = { file: { name: 'photo.jpg' } };

      const fakeProcessResult = {
        fileName: 'unique_photo.jpg',
        metadata: { width: 100, height: 100 }
      };
      serviceStub.processarFoto.mockResolvedValue(fakeProcessResult);

      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data) => {
        res.status(200).json(data);
      });

      await controller.fotoUpload(req, res, next);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.processarFoto).toHaveBeenCalledWith('123', req.files.file);
      expect(successSpy).toHaveBeenCalledWith(res, {
        message: 'Arquivo recebido e usuário atualizado com sucesso.',
        dados: { link_foto: fakeProcessResult.fileName },
        metadados: fakeProcessResult.metadata
      });

      idParseSpy.mockRestore();
      successSpy.mockRestore();
    });

    it('deve chamar next com erro se nenhum arquivo for enviado', async () => {
      req.params = { id: '123' };
      req.files = {};

      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});
      await controller.fotoUpload(req, res, next);
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(CustomError);
      expect(error.customMessage).toBe('Nenhum arquivo foi enviado.');

      idParseSpy.mockRestore();
    });
  });

  describe('getFoto', () => {
    it('deve enviar o arquivo se a foto existir', async () => {
      req.params = { id: '123' };
      const fakeUsuario = { link_foto: 'photo.jpg' };
      serviceStub.listar.mockResolvedValue(fakeUsuario);
      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});

      await controller.getFoto(req, res, next);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.listar).toHaveBeenCalledWith(req);
      expect(res.setHeader).toHaveBeenCalled();
      expect(res.sendFile).toHaveBeenCalled();

      idParseSpy.mockRestore();
    });

    it('deve chamar next com erro se a foto não for encontrada', async () => {
      req.params = { id: '123' };
      const fakeUsuario = {}; // no link_foto
      serviceStub.listar.mockResolvedValue(fakeUsuario);
      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});

      await controller.getFoto(req, res, next);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.listar).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(CustomError);
      expect(error.customMessage).toBe('Foto do usuário não encontrada.');

      idParseSpy.mockRestore();
    });
  });
});

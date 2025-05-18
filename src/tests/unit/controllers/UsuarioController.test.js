// =================================================================
// Mocks que precisam ser definidos ANTES de quaisquer outros imports
// =================================================================

// Atualize o mock do sharp para incluir as propriedades faltantes.
jest.mock('sharp', () => {
    // Função que simula o encadeamento do resize e toBuffer
    const resizeToBufferMock = jest.fn(() => Promise.resolve(Buffer.from('resized image')));
    const resizeMock = jest.fn(() => ({
      toBuffer: resizeToBufferMock,
    }));
  
    // Função principal do sharp
    const sharpMock = jest.fn(() => ({
      resize: resizeMock,
    }));
  
    // Adiciona as propriedades necessárias para a configuração da imagem
    sharpMock.fit = { cover: 'cover' };
    sharpMock.strategy = { entropy: 'entropy' };
  
    return sharpMock;
  });
  
  // Mock do mongoose, simulando Schema e Types
  jest.mock('mongoose', () => {
    class Schema {
      constructor(definition, options) {
        this.definition = definition;
        this.options = options;
        this.index = jest.fn();
        this.plugin = jest.fn();
      }
    }
    Schema.prototype.pre = jest.fn();
    Schema.Types = { ObjectId: 'ObjectId' };
  
    return {
      Schema,
      model: jest.fn(() => ({})),
      connect: jest.fn(),
      connection: {
        on: jest.fn(),
        once: jest.fn(),
        close: jest.fn()
      }
    };
  });
  
  // Mock do uuid
  jest.mock('uuid', () => ({
    v4: jest.fn(() => 'fixed-uuid')
  }));
  
  // Mock dos helpers - IMPORTANTE: usar o mesmo caminho relativo do controller
  jest.mock('../../../utils/helpers/index.js', () => {
    return {
      CommonResponse: {
        success: jest.fn(),
        created: jest.fn()
      },
      CustomError: jest.fn((opts) => {
        const err = new Error(opts.customMessage);
        err.statusCode = opts.statusCode;
        err.errorType = opts.errorType;
        err.field = opts.field;
        err.details = opts.details;
        return err;
      }),
      HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        NOT_FOUND: { code: 404 }
      },
      errorHandler: jest.fn(),
      messages: {},
      StatusService: {},
      asyncWrapper: jest.fn()
    };
  });
  
  // Mocks dos schemas Zod
  jest.mock('../../../utils/validators/schemas/zod/UsuarioSchema.js', () => {
    return {
      UsuarioSchema: { parse: jest.fn() },
      UsuarioUpdateSchema: { parse: jest.fn() }
    };
  });
  
  jest.mock('../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js', () => {
    return {
      UsuarioQuerySchema: { parse: jest.fn() },
      UsuarioIdSchema: { parse: jest.fn() }
    };
  });
  
  // =================================================================
  // Agora, importe os módulos que serão testados
  // =================================================================
  import sharp from 'sharp';
  import path from 'path';
  import fs from 'fs';
  import { v4 as uuidv4 } from 'uuid';
  
  import UsuarioController from '../../../controllers/UsuarioController.js';
  import UsuarioService from '../../../services/UsuarioService.js';
  
  import {
    CommonResponse,
    CustomError,
    HttpStatusCodes
  } from '../../../utils/helpers/index.js';
  
  import {
    UsuarioSchema,
    UsuarioUpdateSchema
  } from '../../../utils/validators/schemas/zod/UsuarioSchema.js';
  
  import {
    UsuarioQuerySchema,
    UsuarioIdSchema
  } from '../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
  
  // =================================================================
  // Testes para UsuarioController
  // =================================================================
  describe('UsuarioController', () => {
    let controller, req, res, next;
  
    beforeEach(() => {
      controller = new UsuarioController();
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        setHeader: jest.fn(),
        sendFile: jest.fn()
      };
      req = { params: {}, query: {}, body: {}, files: {} };
      next = jest.fn();
  
      // Limpa os mocks
      CommonResponse.success.mockClear();
      CommonResponse.created.mockClear();
      UsuarioSchema.parse.mockClear();
      UsuarioUpdateSchema.parse.mockClear();
      UsuarioQuerySchema.parse.mockClear();
      UsuarioIdSchema.parse.mockClear();
  
      // Mocks do Service
      controller.service.listar = jest.fn();
      controller.service.criar = jest.fn();
      controller.service.atualizar = jest.fn();
      controller.service.deletar = jest.fn();
    });
  
    // ============================
    // Testes para o método listar
    // ============================
    describe('listar', () => {
      it('should list users and return response via CommonResponse.success when no id and empty query', async () => {
        const data = [{ id: 1, name: 'Test User' }];
        controller.service.listar.mockResolvedValue(data);
        req.params = {};
        req.query = {};
  
        await controller.listar(req, res);
        expect(controller.service.listar).toHaveBeenCalledWith(req);
        expect(CommonResponse.success).toHaveBeenCalledWith(res, data);
      });
  
      it('should call UsuarioIdSchema.parse when id is provided', async () => {
        req.params = { id: 'test-id' };
        req.query = {}; // query vazia
        const data = { id: 'test-id', name: 'Test' };
        controller.service.listar.mockResolvedValue(data);
  
        await controller.listar(req, res);
        expect(UsuarioIdSchema.parse).toHaveBeenCalledWith('test-id');
        expect(CommonResponse.success).toHaveBeenCalledWith(res, data);
      });
  
      it('should call UsuarioQuerySchema.parse when query is provided', async () => {
        req.params = {};
        req.query = { search: 'Test' };
        const data = [{ id: 1, name: 'Test User' }];
        controller.service.listar.mockResolvedValue(data);
  
        await controller.listar(req, res);
        expect(UsuarioQuerySchema.parse).toHaveBeenCalledWith(req.query);
        expect(CommonResponse.success).toHaveBeenCalledWith(res, data);
      });
  
      it('should validate both id and query if provided', async () => {
        req.params = { id: 'test-id' };
        req.query = { search: 'foo' };
        const data = { id: 'test-id', name: 'Test User' };
        controller.service.listar.mockResolvedValue(data);
  
        await controller.listar(req, res);
        expect(UsuarioIdSchema.parse).toHaveBeenCalledWith('test-id');
        expect(UsuarioQuerySchema.parse).toHaveBeenCalledWith(req.query);
        expect(CommonResponse.success).toHaveBeenCalledWith(res, data);
      });
  
      it('should log message in listar', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.params = {};
        req.query = {};
        controller.service.listar.mockResolvedValue([]);
        await controller.listar(req, res);
        expect(logSpy).toHaveBeenCalledWith('Estou no listar em UsuarioController');
        logSpy.mockRestore();
      });
    });
  
    // ============================
    // Testes para o método criar
    // ============================
    describe('criar', () => {
      it('should create a user and return response with 201', async () => {
        const userInput = { name: 'New User' };
        req.body = userInput;
        UsuarioSchema.parse.mockReturnValue(userInput);
  
        const createdData = { id: 2, ...userInput };
        controller.service.criar.mockResolvedValue(createdData);
  
        await controller.criar(req, res);
        expect(UsuarioSchema.parse).toHaveBeenCalledWith(req.body);
        expect(controller.service.criar).toHaveBeenCalledWith(userInput);
        expect(CommonResponse.created).toHaveBeenCalledWith(res, createdData);
      });
  
      it('should log message in criar', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.body = { name: 'New User' };
        UsuarioSchema.parse.mockReturnValue(req.body);
        const createdData = { id: 2, name: 'New User' };
        controller.service.criar.mockResolvedValue(createdData);
        await controller.criar(req, res);
        expect(logSpy).toHaveBeenCalledWith('Estou no criar em UsuarioController');
        logSpy.mockRestore();
      });
    });
  
    // ============================
    // Testes para o método atualizar
    // ============================
    describe('atualizar', () => {
      it('should update an existing user and return response via CommonResponse.success', async () => {
        const userUpdate = { name: 'Updated User' };
        req.params = { id: '67a55e30c516c13964c800c2' };
        req.body = userUpdate;
  
        UsuarioUpdateSchema.parse.mockReturnValue(userUpdate);
  
        const updatedData = { id: '67a55e30c516c13964c800c2', ...userUpdate };
        controller.service.atualizar.mockResolvedValue(updatedData);
  
        await controller.atualizar(req, res);
  
        expect(UsuarioUpdateSchema.parse).toHaveBeenCalledWith(req.body);
        expect(controller.service.atualizar).toHaveBeenCalledWith(
          '67a55e30c516c13964c800c2',
          userUpdate
        );
        expect(CommonResponse.success).toHaveBeenCalledWith(res, updatedData);
      });
  
      it('should log message in atualizar', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.params = { id: 'test-id' };
        req.body = { name: 'Updated User' };
        UsuarioUpdateSchema.parse.mockReturnValue(req.body);
        const updatedData = { id: 'test-id', name: 'Updated User' };
        controller.service.atualizar.mockResolvedValue(updatedData);
        await controller.atualizar(req, res);
        expect(logSpy).toHaveBeenCalledWith('Estou no atualizar em UsuarioController');
        logSpy.mockRestore();
      });
  
      it('should throw error in atualizar when id is missing', async () => {
        req.params = {}; // Sem id
        // Configura o mock para lançar erro se id for undefined
        UsuarioIdSchema.parse.mockImplementationOnce(() => { throw new Error("Invalid id"); });
        await expect(controller.atualizar(req, res)).rejects.toThrow("Invalid id");
      });
    });
  
    // ============================
    // Testes para o método deletar
    // ============================
    describe('deletar', () => {
      it('should delete a user and return response via CommonResponse.success', async () => {
        req.params = { id: '67a55e30c516c13964c800c2' };
        const deletionResult = { deleted: true };
        controller.service.deletar.mockResolvedValue(deletionResult);
  
        await controller.deletar(req, res);
        expect(controller.service.deletar).toHaveBeenCalledWith('67a55e30c516c13964c800c2');
        expect(CommonResponse.success).toHaveBeenCalledWith(
          res,
          deletionResult,
          200,
          'Usuário excluído com sucesso.'
        );
      });
  
      it('should throw an error when id is missing', async () => {
        req.params = {};
        await expect(controller.deletar(req, res)).rejects.toThrow(
          'ID do usuário é obrigatório para deletar.'
        );
      });
  
      it('should log message in deletar', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.params = { id: 'test-id' };
        const deletionResult = { deleted: true };
        controller.service.deletar.mockResolvedValue(deletionResult);
        await controller.deletar(req, res);
        expect(logSpy).toHaveBeenCalledWith('Estou no deletar em UsuarioController');
        logSpy.mockRestore();
      });
    });
  
    // ============================
    // Testes para o método fotoUpload
    // ============================
    describe('fotoUpload', () => {
      beforeEach(() => {
        req.params = { id: '67a55e30c516c13964c800c2' };
      });
  
      it('should upload a photo, update the user and return success response (uploads dir exists)', async () => {
        const fakeFile = {
          name: 'photo.jpg',
          data: Buffer.from('fake image data'),
          size: 1024,
          md5: 'fake-md5'
        };
        req.files = { file: fakeFile };
  
        // Validação dos dados para atualização da foto
        UsuarioUpdateSchema.parse.mockReturnValue({ link_foto: 'fixed-uuid.jpg' });
  
        // Mocks do sharp
        const toBufferMock = jest.fn().mockResolvedValue(Buffer.from('resized image'));
        const resizeMock = jest.fn().mockReturnValue({ toBuffer: toBufferMock });
        sharp.mockImplementation(() => ({ resize: resizeMock }));
  
        // Simula que o diretório de uploads já existe
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  
        const updatedData = {
          id: '67a55e30c516c13964c800c2',
          link_foto: 'fixed-uuid.jpg'
        };
        controller.service.atualizar.mockResolvedValue(updatedData);
  
        await controller.fotoUpload(req, res, next);
  
        expect(CommonResponse.success).toHaveBeenCalledWith(
          res,
          expect.objectContaining({
            message: expect.any(String),
            dados: { link_foto: expect.any(String) },
            metadados: expect.any(Object)
          })
        );
        expect(controller.service.atualizar).toHaveBeenCalled();
      });
  
      it('should create uploads directory if it does not exist', async () => {
        const fakeFile = {
          name: 'photo.png',
          data: Buffer.from('image data'),
          size: 500,
          md5: 'dummy-md5'
        };
        req.files = { file: fakeFile };
  
        UsuarioUpdateSchema.parse.mockReturnValue({ link_foto: 'fixed-uuid.png' });
  
        const toBufferMock = jest.fn().mockResolvedValue(Buffer.from('resized image'));
        const resizeMock = jest.fn().mockReturnValue({ toBuffer: toBufferMock });
        sharp.mockImplementation(() => ({ resize: resizeMock }));
  
        // Simula que o diretório de uploads NÃO existe
        const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
  
        jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  
        const updatedData = {
          id: '67a55e30c516c13964c800c2',
          link_foto: 'fixed-uuid.png'
        };
        controller.service.atualizar.mockResolvedValue(updatedData);
  
        await controller.fotoUpload(req, res, next);
  
        expect(mkdirSpy).toHaveBeenCalled(); // Verifica se o diretório foi criado
        expect(CommonResponse.success).toHaveBeenCalled();
  
        existsSpy.mockRestore();
        mkdirSpy.mockRestore();
      });
  
      describe('error cases', () => {
        it('should call next with error when no file is provided', async () => {
          req.files = {};
          await controller.fotoUpload(req, res, next);
          expect(next).toHaveBeenCalled();
        });
  
        it('should call next with error when file extension is invalid', async () => {
          req.files = {
            file: {
              name: 'malware.exe',
              data: Buffer.from('data'),
              size: 100,
              md5: 'fake-md5'
            }
          };
          await controller.fotoUpload(req, res, next);
          expect(next).toHaveBeenCalled();
        });
      });
    });
  
    // ============================
    // Testes para o método getFoto
    // ============================
    describe('getFoto', () => {
      it('should retrieve and send the photo file', async () => {
        req.params = { id: '67a55e30c516c13964c800c2' };
        const fakeUser = { link_foto: 'photo.png' };
        controller.service.listar.mockResolvedValue(fakeUser);
  
        await controller.getFoto(req, res, next);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
        expect(res.sendFile).toHaveBeenCalled();
      });
  
      it('should set content type to application/octet-stream for unknown extension', async () => {
        req.params = { id: 'some-id' };
        const fakeUser = { link_foto: 'photo.unknown' };
        controller.service.listar.mockResolvedValue(fakeUser);
  
        await controller.getFoto(req, res, next);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
        expect(res.sendFile).toHaveBeenCalled();
      });
  
      it('should call next with error if user does not have a photo link_foto', async () => {
        req.params = { id: '67a55e30c516c13964c800c2' };
        const fakeUser = { link_foto: null };
        controller.service.listar.mockResolvedValue(fakeUser);
  
        await controller.getFoto(req, res, next);
        expect(next).toHaveBeenCalled();
      });
  
      it('should log message in getFoto', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        req.params = { id: 'test-id' };
        const fakeUser = { link_foto: 'photo.png' };
        controller.service.listar.mockResolvedValue(fakeUser);
        await controller.getFoto(req, res, next);
        expect(logSpy).toHaveBeenCalledWith('Estou no getFoto em UsuarioController');
        logSpy.mockRestore();
      });
    });
  });
  
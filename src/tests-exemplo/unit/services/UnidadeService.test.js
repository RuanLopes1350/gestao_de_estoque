// src/tests/unit/services/UnidadeService.test.js

// ★ IMPORTANTÍSSIMO: Mock do método mongoose.model antes de qualquer importação
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
      ...actualMongoose,
      model: jest.fn(), // Evita a criação do modelo e plugins associados
    };
  });
  
  import mongoose from 'mongoose';
  import UnidadeService from '../../../services/UnidadeService.js';
  import UnidadeRepository from '../../../repositories/UnidadeRepository.js';
  import CustomError from '../../../utils/helpers/CustomError.js';
  import messages from '../../../utils/helpers/messages.js';
  import { UnidadeSchema, UnidadeUpdateSchema } from '../../../utils/validators/schemas/zod/UnidadeSchema.js';
  
  // Mock da UnidadeRepository usando Jest
  jest.mock('../../../repositories/UnidadeRepository.js');
  
  describe('UnidadeService', () => {
    let unidadeService;
    let unidadeRepositoryMock;
  
    beforeEach(() => {
      // Instancia a UnidadeRepository mockada e injeta no serviço
      unidadeRepositoryMock = new UnidadeRepository();
      unidadeService = new UnidadeService();
      unidadeService.repository = unidadeRepositoryMock;
    });
  
    afterEach(() => {
      jest.resetAllMocks();
    });
  
    // Opcional: se por acaso alguma conexão for aberta, desconectamos o mongoose
    afterAll(async () => {
      await mongoose.disconnect();
    });
  
    describe('listar', () => {
      test('deve listar unidades', async () => {
        const req = { query: {} };
        const expectedData = [{ id: 1, nome: 'Unidade 1' }];
  
        // Configura o mock para retornar os dados esperados
        unidadeRepositoryMock.listar.mockResolvedValue(expectedData);
  
        const data = await unidadeService.listar(req);
  
        expect(data).toEqual(expectedData);
        expect(unidadeRepositoryMock.listar).toHaveBeenCalledTimes(1);
        expect(unidadeRepositoryMock.listar).toHaveBeenCalledWith(req);
      });
    });
  
    describe('criar', () => {
      test('deve criar uma unidade', async () => {
        const req = { body: { nome: 'Unidade 1', localidade: 'Local 1' } };
        const validatedData = { nome: 'Unidade 1', localidade: 'Local 1' };
        const expectedData = { id: 1, nome: 'Unidade 1', localidade: 'Local 1' };
  
        // Para o sucesso, retorna null (ou falsy) para buscarPorNome
        unidadeRepositoryMock.buscarPorNome = jest.fn().mockResolvedValue(null);
        // Mock do parseAsync do schema
        UnidadeSchema.parseAsync = jest.fn().mockResolvedValue(validatedData);
        // Mock do método criar do repositório
        unidadeRepositoryMock.criar = jest.fn().mockResolvedValue(expectedData);
  
        const data = await unidadeService.criar(req);
  
        expect(data).toEqual(expectedData);
        expect(unidadeRepositoryMock.buscarPorNome).toHaveBeenCalledWith(req.body.nome, req.body.localidade);
        expect(UnidadeSchema.parseAsync).toHaveBeenCalledWith(req.body);
        expect(unidadeRepositoryMock.criar).toHaveBeenCalledWith(validatedData);
      });
  
      test('deve lançar erro se unidade já existir', async () => {
        const req = { body: { nome: 'Unidade 1', localidade: 'Local 1' } };
        const existingUnit = { id: 2, nome: 'Unidade 1', localidade: 'Local 1' };
  
        // Mock para indicar que a unidade já existe
        unidadeRepositoryMock.buscarPorNome = jest.fn().mockResolvedValue(existingUnit);
  
        await expect(unidadeService.criar(req)).rejects.toThrow(CustomError);
  
        try {
          await unidadeService.criar(req);
        } catch (error) {
          expect(error.statusCode).toBe(400);
          expect(error.errorType).toBe('validationError');
          expect(error.field).toBe('nome');
          expect(error.customMessage).toBe(messages.validation.generic.resourceAlreadyExists('Nome'));
        }
      });
    });
  
    describe('atualizar', () => {
      test('deve atualizar uma unidade', async () => {
        const req = { params: { id: 1 }, body: { nome: 'Unidade Atualizada' } };
        const validatedData = { id: 1, nome: 'Unidade Atualizada' };
        const expectedData = { id: 1, nome: 'Unidade Atualizada' };
  
        // Mock do parseAsync do schema de atualização
        UnidadeUpdateSchema.parseAsync = jest.fn().mockResolvedValue(validatedData);
        // Mock do método atualizar do repositório
        unidadeRepositoryMock.atualizar = jest.fn().mockResolvedValue(expectedData);
  
        const data = await unidadeService.atualizar(req);
  
        expect(data).toEqual(expectedData);
        expect(UnidadeUpdateSchema.parseAsync).toHaveBeenCalledWith({ ...req.body, id: req.params.id });
        expect(unidadeRepositoryMock.atualizar).toHaveBeenCalledWith(req.params.id, validatedData);
      });
  
      test('deve lançar erro se o id não for fornecido', async () => {
        const req = { params: {}, body: { nome: 'Unidade Atualizada' } };
  
        await expect(unidadeService.atualizar(req)).rejects.toThrow(CustomError);
  
        try {
          await unidadeService.atualizar(req);
        } catch (error) {
          expect(error.statusCode).toBe(400);
          expect(error.errorType).toBe('validationError');
          expect(error.field).toBe('id');
          expect(error.customMessage).toBe(messages.validation.generic.fieldIsRequired('ID'));
        }
      });
    });
  
    describe('deletar', () => {
      test('deve deletar uma unidade', async () => {
        const id = 1;
        const expectedData = { id: 1 };
  
        // Garante que a unidade existe
        unidadeRepositoryMock.buscarPorId = jest.fn().mockResolvedValue(expectedData);
        // Configura o mock para verificar que não há usuários associados
        unidadeRepositoryMock.verificarUsuariosAssociados = jest.fn().mockResolvedValue(false);
        // Mock para a deleção propriamente dita
        unidadeRepositoryMock.deletar = jest.fn().mockResolvedValue(expectedData);
  
        const data = await unidadeService.deletar(id);
  
        expect(data).toEqual(expectedData);
        expect(unidadeRepositoryMock.deletar).toHaveBeenCalledWith(id);
      });
  
      test('deve lançar erro se houver usuários associados', async () => {
        const id = 1;
        const existingUnit = { id: 1, nome: 'Unidade 1' };
  
        // Garante que a unidade existe
        unidadeRepositoryMock.buscarPorId = jest.fn().mockResolvedValue(existingUnit);
        // Configura o mock para indicar que há usuários associados
        unidadeRepositoryMock.verificarUsuariosAssociados = jest.fn().mockResolvedValue(true);
  
        await expect(unidadeService.deletar(id)).rejects.toThrow(CustomError);
  
        try {
          await unidadeService.deletar(id);
        } catch (error) {
          expect(error.statusCode).toBe(400);
          expect(error.errorType).toBe('resourceConflict');
          expect(error.field).toBe('Grupo');
          expect(error.customMessage).toBe(messages.error.resourceConflict('Grupo', 'Usuários associados'));
        }
      });
    });
  
    describe('ensureUnitExists', () => {
      test('deve lançar erro se a unidade não existir', async () => {
        const id = 1;
        // Mock para indicar que não há unidade com o ID
        unidadeRepositoryMock.buscarPorId = jest.fn().mockResolvedValue(null);
  
        await expect(unidadeService.ensureUnitExists(id)).rejects.toThrow(CustomError);
  
        try {
          await unidadeService.ensureUnitExists(id);
        } catch (error) {
          expect(error.statusCode).toBe(404);
          expect(error.errorType).toBe('resourceNotFound');
          expect(error.field).toBe('Unidade');
          expect(error.customMessage).toBe(messages.error.resourceNotFound('Unidade'));
        }
      });
  
      test('deve passar se a unidade existir', async () => {
        const id = 1;
        const existingUnit = { id: 1, nome: 'Unidade 1' };
        unidadeRepositoryMock.buscarPorId = jest.fn().mockResolvedValue(existingUnit);
  
        await expect(unidadeService.ensureUnitExists(id)).resolves.toBeUndefined();
      });
    });
  });
  
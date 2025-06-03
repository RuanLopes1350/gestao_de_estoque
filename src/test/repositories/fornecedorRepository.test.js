import FornecedorRepository from '../../repositories/fornecedorRepository.js';
import FornecedorModel from '../../models/Fornecedor.js';
import mongoose from 'mongoose';
import { CustomError, messages } from '../../utils/helpers/index.js';
import FornecedorFilterBuilder from '../../repositories/filters/FornecedorFilterBuilder.js';

// Mock do modelo Fornecedor
jest.mock('../../models/Fornecedor.js', () => {
  const mockModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(() => ({
      sort: jest.fn().mockReturnThis(),
    })),
    paginate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  mockModel.mockImplementation = function () {
    return {
      save: jest.fn(),
    };
  };

  return mockModel;
});

// Mock do mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn().mockReturnValue(true),
    },
  },
  model: jest.fn(() => ({
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    }),
  })),
}));

// Mock do FornecedorFilterBuilder
jest.mock('../../repositories/filters/FornecedorFilterBuilder.js', () => {
  return jest.fn().mockImplementation(() => {
    const mockBuilder = {
      comCNPJ: jest.fn().mockReturnThis(),
      comNome: jest.fn().mockReturnThis(),
      build: jest.fn(),
    };

    mockBuilder.build.mockReturnValue({});

    return mockBuilder;
  });
});

// Mock da CustomError e mensagens
jest.mock('../../utils/helpers/index.js', () => ({
  CustomError: class extends Error {
    constructor({ statusCode, errorType, field, details, customMessage }) {
      super(customMessage);
      this.statusCode = statusCode;
      this.errorType = errorType;
      this.field = field;
      this.details = details;
    }
  },
  messages: {
    error: {
      internalServerError: (resource) => `Erro interno no ${resource}`,
      resourceNotFound: (resource) => `${resource} não encontrado`,
      resourceAlreadyExists: (resource) => `${resource} já existe`,
    },
  },
}));

describe('FornecedorRepository', () => {
  let fornecedorRepository;
  let mockModel;
  let mockFilterBuilder;

  beforeEach(() => {
    jest.clearAllMocks();

    function MockModel(data) {
      return {
        ...data,
        save: jest.fn().mockResolvedValue(data),
      };
    }

    MockModel.findById = jest.fn();
    MockModel.findOne = jest.fn();
    MockModel.find = jest.fn(() => ({ sort: jest.fn().mockResolvedValue([]) }));
    MockModel.paginate = jest.fn();
    MockModel.findByIdAndUpdate = jest.fn();
    MockModel.findByIdAndDelete = jest.fn();

    mockModel = MockModel;
    fornecedorRepository = new FornecedorRepository({ model: mockModel });

    // Criamos funções mock para cada método do builder
    const mockComCNPJ = jest.fn().mockReturnThis();
    const mockComNome = jest.fn().mockReturnThis();
    const mockBuildFn = jest.fn();

    // Configuramos a implementação do mock com as funções definidas acima
    FornecedorFilterBuilder.mockImplementation(() => ({
      comCNPJ: mockComCNPJ,
      comNome: mockComNome,
      build: mockBuildFn,
    }));

    // Armazenamos referencias para todas as funções mock para uso nos testes
    mockFilterBuilder = {
      comCNPJ: mockComCNPJ,
      comNome: mockComNome,
      build: mockBuildFn,
    };
  });

  describe('buscarFornecedorPorId', () => {
    it('deve encontrar um fornecedor pelo ID', async () => {
      const mockFornecedor = { _id: '123', nome_fornecedor: 'Fornecedor Teste' };
      mockModel.findById.mockResolvedValue(mockFornecedor);

      const result = await fornecedorRepository.buscarFornecedorPorId('123');

      expect(result).toEqual(mockFornecedor);
      expect(mockModel.findById).toHaveBeenCalledWith('123');
    });

    it('deve lançar erro se o fornecedor não for encontrado', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(fornecedorRepository.buscarFornecedorPorId('123')).rejects.toThrow(CustomError);
      expect(mockModel.findById).toHaveBeenCalledWith('123');
    });
  });

  describe('criarFornecedor', () => {
    it('deve cadastrar um novo fornecedor', async () => {
      const dadosFornecedor = {
        nome_fornecedor: 'Fornecedor Teste',
        cnpj: '12345678000199',
        telefone: '11999999999',
      };

      mockModel.findOne.mockResolvedValue(null);
      mockModel.mockImplementation = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(data),
      }));

      const result = await fornecedorRepository.criarFornecedor(dadosFornecedor);

      expect(result).toEqual(dadosFornecedor);
      expect(mockModel.findOne).toHaveBeenCalledWith({ cnpj: '12345678000199' });
    });

    it('deve lançar erro se já existir fornecedor com mesmo CNPJ', async () => {
      const dadosFornecedor = {
        nome_fornecedor: 'Fornecedor Teste',
        cnpj: '12345678000199',
        telefone: '11999999999',
      };

      mockModel.findOne.mockResolvedValue({ _id: '123', cnpj: '12345678000199' });

      await expect(fornecedorRepository.criarFornecedor(dadosFornecedor)).rejects.toThrow(CustomError);
      expect(mockModel.findOne).toHaveBeenCalledWith({ cnpj: '12345678000199' });
    });
  });

  describe('listarFornecedores', () => {
    it('deve listar fornecedores com filtros e paginação', async () => {
      const mockResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
      };

      mockModel.paginate.mockResolvedValue(mockResult);
      mockFilterBuilder.build.mockReturnValue({ cnpj: '123' });

      const query = { cnpj: '123', nome_fornecedor: 'Fornecedor', page: '1', limite: '10' };

      const result = await fornecedorRepository.listarFornecedores(query);

      expect(mockFilterBuilder.comCNPJ).toHaveBeenCalledWith('123');
      expect(mockFilterBuilder.comNome).toHaveBeenCalledWith('Fornecedor');
      expect(mockFilterBuilder.build).toHaveBeenCalled();

      expect(mockModel.paginate).toHaveBeenCalledWith({ cnpj: '123' }, expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('atualizarFornecedor', () => {
    it('deve atualizar um fornecedor existente', async () => {
      const id = '123';
      const dadosAtualizados = { nome_fornecedor: 'Fornecedor Atualizado' };
      const mockFornecedorAtualizado = { _id: id, ...dadosAtualizados };

      mockModel.findByIdAndUpdate.mockResolvedValue(mockFornecedorAtualizado);

      const result = await fornecedorRepository.atualizarFornecedor(id, dadosAtualizados);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, dadosAtualizados, { new: true });
      expect(result).toEqual(mockFornecedorAtualizado);
    });

    it('deve lançar erro se fornecedor não for encontrado para atualizar', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(fornecedorRepository.atualizarFornecedor('123', {})).rejects.toThrow(CustomError);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('123', {}, { new: true });
    });
  });

  describe('deletarFornecedor', () => {
    it('deve deletar um fornecedor existente', async () => {
      const mockFornecedor = { _id: '123', nome_fornecedor: 'Fornecedor Teste' };

      mockModel.findByIdAndDelete.mockResolvedValue(mockFornecedor);

      const result = await fornecedorRepository.deletarFornecedor('123');

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockFornecedor);
    });

    it('deve lançar erro se fornecedor não for encontrado para deletar', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(fornecedorRepository.deletarFornecedor('123')).rejects.toThrow(CustomError);
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    });
  });
});

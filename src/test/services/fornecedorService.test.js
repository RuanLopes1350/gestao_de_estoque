import FornecedorService from '../../services/fornecedorService.js';
import FornecedorRepository from '../../repositories/fornecedorRepository.js';
import mongoose from 'mongoose';
import { CustomError } from '../../utils/helpers/index.js';

jest.mock('../../models/Fornecedor.js', () => {
  return {
    __esModule: true,
    default: {}
  };
});

jest.mock('../../repositories/fornecedorRepository.js');
jest.mock('mongoose', () => ({
  Schema: function(schema) {
    return { schema };
  },
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  },
  model: jest.fn(() => ({
    find: jest.fn().mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue([])
    }))
  }))
}));

describe('FornecedorService', () => {
  let fornecedorService;
  let mockRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRepository = {
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
    };

    FornecedorRepository.mockImplementation(() => mockRepository);
    
    fornecedorService = new FornecedorService();
  });

  describe('listar', () => {
    it('deve listar fornecedores', async () => {
      const req = { query: { page: 1, limite: 10 } };
      const mockFornecedores = {
        docs: [{ nome_fornecedor: 'Fornecedor Teste', contato: 'teste@teste.com' }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };
      
      mockRepository.listar.mockResolvedValue(mockFornecedores);

      const result = await fornecedorService.listar(req);
      
      expect(mockRepository.listar).toHaveBeenCalledWith(req);
      expect(result).toEqual(mockFornecedores);
    });
  });

  describe('criar', () => {
    it('deve criar um fornecedor com sucesso', async () => {
      const dadosFornecedor = {
        nome_fornecedor: 'Fornecedor Novo',
        contato: 'contato@fornecedor.com',
        telefone: '123456789'
      };
      
      const fornecedorCriado = { ...dadosFornecedor, _id: '123' };
      mockRepository.criar.mockResolvedValue(fornecedorCriado);

      const result = await fornecedorService.criar(dadosFornecedor);
      
      expect(mockRepository.criar).toHaveBeenCalledWith(expect.objectContaining(dadosFornecedor));
      expect(result).toEqual(fornecedorCriado);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um fornecedor com sucesso', async () => {
      const id = '60d21b4667d0d8992e610c85';
      const dadosAtualizacao = { nome_fornecedor: 'Fornecedor Atualizado' };
      const fornecedorAtualizado = { _id: id, ...dadosAtualizacao };
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      mockRepository.atualizar.mockResolvedValue(fornecedorAtualizado);

      const result = await fornecedorService.atualizar(id, dadosAtualizacao);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.atualizar).toHaveBeenCalledWith(id, dadosAtualizacao);
      expect(result).toEqual(fornecedorAtualizado);
    });

    it('deve lançar erro quando o ID é inválido', async () => {
      const id = 'id_invalido';
      const dadosAtualizacao = { nome_fornecedor: 'Fornecedor Atualizado' };
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await expect(fornecedorService.atualizar(id, dadosAtualizacao))
        .rejects.toThrow(CustomError);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.atualizar).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('deve encontrar um fornecedor pelo ID', async () => {
      const id = '60d21b4667d0d8992e610c85';
      const mockFornecedor = { _id: id, nome_fornecedor: 'Fornecedor Teste', contato: 'teste@teste.com' };
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      mockRepository.buscarPorId.mockResolvedValue(mockFornecedor);

      const result = await fornecedorService.buscarPorId(id);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.buscarPorId).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockFornecedor);
    });

    it('deve lançar erro quando o ID é inválido', async () => {
      const id = 'id_invalido';
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await expect(fornecedorService.buscarPorId(id))
        .rejects.toThrow(CustomError);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.buscarPorId).not.toHaveBeenCalled();
    });
  });

  describe('deletar', () => {
    it('deve deletar um fornecedor pelo ID', async () => {
      const id = '60d21b4667d0d8992e610c85';
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
      mockRepository.deletar.mockResolvedValue(true);

      const result = await fornecedorService.deletar(id);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.deletar).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('deve lançar erro quando o ID para deletar é inválido', async () => {
      const id = 'id_invalido';
      
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await expect(fornecedorService.deletar(id))
        .rejects.toThrow(CustomError);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.deletar).not.toHaveBeenCalled();
    });
  });

});

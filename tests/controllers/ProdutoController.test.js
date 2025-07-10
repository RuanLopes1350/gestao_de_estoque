import { beforeAll, afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import ProdutoController from '../../src/controllers/ProdutoController.js';
import ProdutoService from '../../src/services/produtoService.js';
import { CustomError } from '../../src/utils/helpers/index.js';

// Mock the console.log to avoid cluttering test output
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ProdutoController', () => {
  let mongoServer;
  let produtoController;
  let mockReq;
  let mockRes;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(() => {
    produtoController = new ProdutoController();
    
    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock request object
    mockReq = {
      params: {},
      query: {},
      body: {}
    };
  });

  describe('Constructor', () => {
    it('should initialize with ProdutoService', () => {
      expect(produtoController.service).toBeInstanceOf(ProdutoService);
    });
  });

  describe('listarProdutos', () => {
    it('should list products successfully with default pagination', async () => {
      const mockProducts = {
        docs: [
          { _id: '1', nome_produto: 'Produto 1' },
          { _id: '2', nome_produto: 'Produto 2' }
        ],
        totalDocs: 2,
        page: 1
      };

      jest.spyOn(produtoController.service, 'listarProdutos').mockResolvedValue(mockProducts);

      await produtoController.listarProdutos(mockReq, mockRes);

      expect(produtoController.service.listarProdutos).toHaveBeenCalledWith(mockReq);
      expect(mockReq.query.page).toBe(1);
      expect(mockReq.query.limite).toBe(10);
    });

    it('should handle empty product list', async () => {
      const mockEmptyResult = {
        docs: [],
        totalDocs: 0,
        page: 1
      };

      jest.spyOn(produtoController.service, 'listarProdutos').mockResolvedValue(mockEmptyResult);

      await produtoController.listarProdutos(mockReq, mockRes);

      expect(produtoController.service.listarProdutos).toHaveBeenCalledWith(mockReq);
    });

    it('should handle product listing with ID parameter', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';
      const mockProduct = { _id: '507f1f77bcf86cd799439011', nome_produto: 'Produto Teste' };

      jest.spyOn(produtoController.service, 'listarProdutos').mockResolvedValue(mockProduct);

      await produtoController.listarProdutos(mockReq, mockRes);

      expect(produtoController.service.listarProdutos).toHaveBeenCalledWith(mockReq);
    });

    it('should throw error for invalid ID format', async () => {
      mockReq.params.id = 'invalid-id';

      await expect(
        produtoController.listarProdutos(mockReq, mockRes)
      ).rejects.toThrow();
    });
  });

  describe('buscarProdutoPorID', () => {
    it('should find product by valid ID', async () => {
      const validId = '507f1f77bcf86cd799439011';
      mockReq.params.id = validId;
      const mockProduct = { _id: validId, nome_produto: 'Produto Teste' };

      jest.spyOn(produtoController.service, 'buscarProdutoPorID').mockResolvedValue(mockProduct);

      await produtoController.buscarProdutoPorID(mockReq, mockRes);

      expect(produtoController.service.buscarProdutoPorID).toHaveBeenCalledWith(validId);
    });

    it('should throw error for invalid ID format', async () => {
      mockReq.params.id = 'invalid-id';

      await expect(
        produtoController.buscarProdutoPorID(mockReq, mockRes)
      ).rejects.toThrow();
    });
  });

  describe('buscarProdutos', () => {
    it('should search products by name', async () => {
      mockReq.query = { nome: 'Notebook', page: '1', limite: '10' };
      const mockProducts = {
        docs: [{ _id: '1', nome_produto: 'Notebook Dell' }],
        totalDocs: 1
      };

      jest.spyOn(produtoController.service, 'buscarProdutosPorNome').mockResolvedValue(mockProducts);

      await produtoController.buscarProdutos(mockReq, mockRes);

      expect(produtoController.service.buscarProdutosPorNome).toHaveBeenCalledWith('Notebook', 1, 10);
    });

    it('should search products by categoria', async () => {
      mockReq.query = { categoria: 'Eletrônicos', page: '1', limite: '10' };
      const mockProducts = {
        docs: [{ _id: '1', categoria: 'Eletrônicos' }],
        totalDocs: 1
      };

      jest.spyOn(produtoController.service, 'buscarProdutosPorCategoria').mockResolvedValue(mockProducts);

      await produtoController.buscarProdutos(mockReq, mockRes);

      expect(produtoController.service.buscarProdutosPorCategoria).toHaveBeenCalledWith('Eletrônicos', 1, 10);
    });

    it('should search products by codigo', async () => {
      mockReq.query = { codigo: 'PROD001', page: '1', limite: '10' };
      const mockProducts = {
        docs: [{ _id: '1', codigo_produto: 'PROD001' }],
        totalDocs: 1
      };

      jest.spyOn(produtoController.service, 'buscarProdutosPorCodigo').mockResolvedValue(mockProducts);

      await produtoController.buscarProdutos(mockReq, mockRes);

      expect(produtoController.service.buscarProdutosPorCodigo).toHaveBeenCalledWith('PROD001', 1, 10);
    });

    it('should search products by fornecedor', async () => {
      mockReq.query = { fornecedor: 'Dell', page: '1', limite: '10' };
      const mockProducts = {
        docs: [{ _id: '1', id_fornecedor: 1 }],
        totalDocs: 1
      };

      jest.spyOn(produtoController.service, 'buscarProdutosPorFornecedor').mockResolvedValue(mockProducts);

      await produtoController.buscarProdutos(mockReq, mockRes);

      expect(produtoController.service.buscarProdutosPorFornecedor).toHaveBeenCalledWith('Dell', 1, 10, true);
    });

    it('should throw error when no search parameter is provided', async () => {
      mockReq.query = { page: '1', limite: '10' };

      await expect(
        produtoController.buscarProdutos(mockReq, mockRes)
      ).rejects.toThrow(CustomError);
    });

    it('should handle empty search results', async () => {
      mockReq.query = { nome: 'NonExistentProduct', page: '1', limite: '10' };
      const mockEmptyResult = {
        docs: [],
        totalDocs: 0
      };

      jest.spyOn(produtoController.service, 'buscarProdutosPorNome').mockResolvedValue(mockEmptyResult);

      await produtoController.buscarProdutos(mockReq, mockRes);

      expect(produtoController.service.buscarProdutosPorNome).toHaveBeenCalledWith('NonExistentProduct', 1, 10);
    });

    it('should use default pagination values', async () => {
      mockReq.query = { nome: 'Notebook' };
      const mockProducts = {
        docs: [{ _id: '1', nome_produto: 'Notebook Dell' }],
        totalDocs: 1
      };

      jest.spyOn(produtoController.service, 'buscarProdutosPorNome').mockResolvedValue(mockProducts);

      await produtoController.buscarProdutos(mockReq, mockRes);

      expect(produtoController.service.buscarProdutosPorNome).toHaveBeenCalledWith('Notebook', 1, 10);
    });

    it('should respect pagination limits', async () => {
      mockReq.query = { nome: 'Notebook', page: '2', limite: '150' }; // limite exceeds max
      const mockProducts = {
        docs: [{ _id: '1', nome_produto: 'Notebook Dell' }],
        totalDocs: 1
      };

      jest.spyOn(produtoController.service, 'buscarProdutosPorNome').mockResolvedValue(mockProducts);

      await produtoController.buscarProdutos(mockReq, mockRes);

      expect(produtoController.service.buscarProdutosPorNome).toHaveBeenCalledWith('Notebook', 2, 100); // limited to 100
    });
  });

  describe('cadastrarProduto', () => {
    it('should create product with valid data', async () => {
      const validProductData = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
      };

      mockReq.body = validProductData;
      const mockCreatedProduct = { _id: '1', ...validProductData };

      jest.spyOn(produtoController.service, 'cadastrarProduto').mockResolvedValue(mockCreatedProduct);

      await produtoController.cadastrarProduto(mockReq, mockRes);

      expect(produtoController.service.cadastrarProduto).toHaveBeenCalledWith(validProductData);
    });
  });

  describe('atualizarProduto', () => {
    it('should update product with valid data', async () => {
      const validId = '507f1f77bcf86cd799439011';
      mockReq.params.id = validId;
      mockReq.body = { preco: 2600.00 };
      
      const mockUpdatedProduct = { _id: validId, preco: 2600.00 };

      jest.spyOn(produtoController.service, 'atualizarProduto').mockResolvedValue(mockUpdatedProduct);

      await produtoController.atualizarProduto(mockReq, mockRes);

      expect(produtoController.service.atualizarProduto).toHaveBeenCalledWith(validId, { preco: 2600.00 });
    });

    it('should throw error when ID is not provided', async () => {
      mockReq.body = { preco: 2600.00 };

      await expect(
        produtoController.atualizarProduto(mockReq, mockRes)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error when no update data is provided', async () => {
      mockReq.params.id = '507f1f77bcf86cd799439011';
      mockReq.body = {};

      await expect(
        produtoController.atualizarProduto(mockReq, mockRes)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error for invalid ID format', async () => {
      mockReq.params.id = 'invalid-id';
      mockReq.body = { preco: 2600.00 };

      await expect(
        produtoController.atualizarProduto(mockReq, mockRes)
      ).rejects.toThrow();
    });
  });
});

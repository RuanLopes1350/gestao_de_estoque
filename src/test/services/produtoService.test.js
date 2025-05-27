import ProdutoService from '../../services/produtoService.js';
import ProdutoRepository from '../../repositories/produtoRepository.js';
import mongoose from 'mongoose';
import { CustomError } from '../../utils/helpers/index.js';

jest.mock('../../models/Produto.js', () => {
  return {
    __esModule: true,
    default: {}
  };
});

jest.mock('../../repositories/produtoRepository.js');
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

describe('ProdutoService', () => {
  let produtoService;
  let mockRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRepository = {
      listarProdutos: jest.fn(),
      cadastrarProduto: jest.fn(),
      buscarProdutoPorID: jest.fn(),
      atualizarProduto: jest.fn(),
      deletarProduto: jest.fn(),
      listarEstoqueBaixo: jest.fn(),
      desativarProduto: jest.fn(),
      reativarProduto: jest.fn(),
    };

    ProdutoRepository.mockImplementation(() => mockRepository);
    
    produtoService = new ProdutoService();
  });

  describe('enriquecerComNomesFornecedores', () => {
    it('deve adicionar nomes de fornecedores a dados paginados', async () => {

      const paginatedData = {
        docs: [
          { id_fornecedor: 123, nome_produto: 'Produto 1' },
          { id_fornecedor: 456, nome_produto: 'Produto 2' },
        ],
        totalDocs: 2,
        limit: 10,
        page: 1
      };
      
      const mockFornecedores = [
        { _id: '123abc456def', nome_fornecedor: 'Fornecedor A' },
        { _id: '789xyz012uvw', nome_fornecedor: 'Fornecedor B' }
      ];
      
      mongoose.model.mockImplementation(() => ({
        find: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockResolvedValue(mockFornecedores)
        }))
      }));

      const result = await produtoService.enriquecerComNomesFornecedores(paginatedData);
      
      expect(result).toBeDefined();
      expect(result.docs).toHaveLength(2);
      expect(result.docs.some(doc => doc.nome_fornecedor)).toBeTruthy();
    });

    it('deve adicionar nome de fornecedor a um único produto', async () => {
      // Único produto
      const produto = { id_fornecedor: 123, nome_produto: 'Produto Único' };
      
      // Mock dos fornecedores
      const mockFornecedores = [
        { _id: '123abc456def', nome_fornecedor: 'Fornecedor A' }
      ];
      
      // Configurar o mock para mongoose.model().find()
      mongoose.model.mockImplementation(() => ({
        find: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockResolvedValue(mockFornecedores)
        }))
      }));

      // Chamar o método
      const result = await produtoService.enriquecerComNomesFornecedores(produto);
      
      // Verificações
      expect(result).toBeDefined();
      expect(result).toHaveProperty('nome_fornecedor');
    });

    it('deve adicionar nomes de fornecedores a um array de produtos', async () => {

      const produtos = [
        { id_fornecedor: 123, nome_produto: 'Produto A' },
        { id_fornecedor: 456, nome_produto: 'Produto B' }
      ];

      const mockFornecedores = [
        { _id: '123abc456def', nome_fornecedor: 'Fornecedor A' },
        { _id: '789xyz012uvw', nome_fornecedor: 'Fornecedor B' }
      ];

      mongoose.model.mockImplementation(() => ({
        find: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockResolvedValue(mockFornecedores)
        }))
      }));

      // Chamar o método
      const result = await produtoService.enriquecerComNomesFornecedores(produtos);
      
      // Verificações
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('nome_fornecedor');
      expect(result[1]).toHaveProperty('nome_fornecedor');
    });
  });

  describe('listarProdutos', () => {
    it('deve listar produtos e enriquecer com nomes de fornecedores', async () => {
      const req = { query: { page: 1, limite: 10 } };
      const mockProdutos = {
        docs: [{ id_fornecedor: 123, nome_produto: 'Produto Teste' }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };
      
      mockRepository.listarProdutos.mockResolvedValue(mockProdutos);

      produtoService.enriquecerComNomesFornecedores = jest.fn().mockResolvedValue({
        ...mockProdutos,
        docs: [{ id_fornecedor: 123, nome_produto: 'Produto Teste', nome_fornecedor: 'Fornecedor Teste' }]
      });

      const result = await produtoService.listarProdutos(req);
      
      expect(mockRepository.listarProdutos).toHaveBeenCalledWith(req);
      expect(produtoService.enriquecerComNomesFornecedores).toHaveBeenCalledWith(mockProdutos);
      expect(result.docs[0].nome_fornecedor).toBe('Fornecedor Teste');
    });
  });

  describe('cadastrarProduto', () => {
    it('deve cadastrar um produto com sucesso', async () => {
      const dadosProduto = {
        nome_produto: 'Novo Produto',
        codigo_produto: 'NP001',
        preco: 99.99
      };
      
      const produtoSalvo = { ...dadosProduto, _id: '123' };
      mockRepository.cadastrarProduto.mockResolvedValue(produtoSalvo);

      const result = await produtoService.cadastrarProduto(dadosProduto);
      
      expect(mockRepository.cadastrarProduto).toHaveBeenCalledWith(expect.objectContaining({
        ...dadosProduto,
        data_ultima_entrada: expect.any(Date),
        status: true
      }));
      expect(result).toEqual(produtoSalvo);
    });

    it('deve manter a data_ultima_entrada se fornecida', async () => {
      const data = new Date('2024-01-15');
      const dadosProduto = {
        nome_produto: 'Novo Produto',
        codigo_produto: 'NP001',
        preco: 99.99,
        data_ultima_entrada: data
      };
      
      const produtoSalvo = { ...dadosProduto, _id: '123' };
      mockRepository.cadastrarProduto.mockResolvedValue(produtoSalvo);

      await produtoService.cadastrarProduto(dadosProduto);
      
      expect(mockRepository.cadastrarProduto).toHaveBeenCalledWith(
        expect.objectContaining({
          data_ultima_entrada: data
        })
      );
    });

    it('deve manter o status se fornecido', async () => {
      const dadosProduto = {
        nome_produto: 'Novo Produto',
        codigo_produto: 'NP001',
        preco: 99.99,
        status: false
      };
      
      const produtoSalvo = { ...dadosProduto, _id: '123' };
      mockRepository.cadastrarProduto.mockResolvedValue(produtoSalvo);

      await produtoService.cadastrarProduto(dadosProduto);
      
      expect(mockRepository.cadastrarProduto).toHaveBeenCalledWith(
        expect.objectContaining({
          status: false
        })
      );
    });
  });

  describe('atualizarProduto', () => {
    it('deve atualizar um produto com sucesso', async () => {
      const id = '60d21b4667d0d8992e610c85';
      const dadosAtualizacao = { nome_produto: 'Produto Atualizado' };
      const produtoAtualizado = { _id: id, ...dadosAtualizacao };
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockRepository.atualizarProduto.mockResolvedValue(produtoAtualizado);

      const result = await produtoService.atualizarProduto(id, dadosAtualizacao);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.atualizarProduto).toHaveBeenCalledWith(id, dadosAtualizacao);
      expect(result).toEqual(produtoAtualizado);
    });

    it('deve lançar erro quando o ID é inválido', async () => {
      const id = 'id_invalido';
      const dadosAtualizacao = { nome_produto: 'Produto Atualizado' };
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await expect(produtoService.atualizarProduto(id, dadosAtualizacao))
        .rejects.toThrow(CustomError);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.atualizarProduto).not.toHaveBeenCalled();
    });
  });

  describe('buscarProdutoPorID', () => {
    it('deve encontrar um produto pelo ID', async () => {
      const id = '60d21b4667d0d8992e610c85';
      const mockProduto = { _id: id, nome_produto: 'Produto Teste' };
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockRepository.buscarProdutoPorID.mockResolvedValue(mockProduto);
      produtoService.enriquecerComNomesFornecedores = jest.fn().mockResolvedValue({
        ...mockProduto,
        nome_fornecedor: 'Fornecedor Teste'
      });

      const result = await produtoService.buscarProdutoPorID(id);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.buscarProdutoPorID).toHaveBeenCalledWith(id);
      expect(produtoService.enriquecerComNomesFornecedores).toHaveBeenCalledWith(mockProduto);
      expect(result.nome_fornecedor).toBe('Fornecedor Teste');
    });

    it('deve lançar erro quando o ID é inválido', async () => {
      const id = 'id_invalido';
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await expect(produtoService.buscarProdutoPorID(id))
        .rejects.toThrow(CustomError);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.buscarProdutoPorID).not.toHaveBeenCalled();
    });
  });

  describe('buscarProdutosPorNome', () => {
    it('deve buscar produtos pelo nome', async () => {
      const nome = 'Teclado';
      const mockProdutos = {
        docs: [{ nome_produto: 'Teclado RGB', id_fornecedor: 123 }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };
      
      mockRepository.listarProdutos.mockResolvedValue(mockProdutos);
      produtoService.enriquecerComNomesFornecedores = jest.fn().mockResolvedValue({
        ...mockProdutos,
        docs: [{ nome_produto: 'Teclado RGB', id_fornecedor: 123, nome_fornecedor: 'Fornecedor Teste' }]
      });

      const result = await produtoService.buscarProdutosPorNome(nome);
      
      expect(mockRepository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: { nome_produto: nome, page: 1, limite: 10 }
      });
      expect(result.docs[0].nome_fornecedor).toBe('Fornecedor Teste');
    });

    it('deve lançar erro quando o nome está vazio', async () => {
      await expect(produtoService.buscarProdutosPorNome(''))
        .rejects.toThrow(CustomError);
      
      expect(mockRepository.listarProdutos).not.toHaveBeenCalled();
    });
  });

  describe('buscarProdutosPorCategoria', () => {
    it('deve buscar produtos pela categoria', async () => {
      const categoria = 'Eletrônicos';
      const mockProdutos = {
        docs: [{ nome_produto: 'Teclado RGB', categoria: 'Eletrônicos', id_fornecedor: 123 }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };
      
      mockRepository.listarProdutos.mockResolvedValue(mockProdutos);
      produtoService.enriquecerComNomesFornecedores = jest.fn().mockResolvedValue({
        ...mockProdutos,
        docs: [{ nome_produto: 'Teclado RGB', categoria: 'Eletrônicos', id_fornecedor: 123, nome_fornecedor: 'Fornecedor Teste' }]
      });

      const result = await produtoService.buscarProdutosPorCategoria(categoria);
      
      expect(mockRepository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: { categoria: categoria, page: 1, limite: 10 }
      });
      expect(result.docs[0].nome_fornecedor).toBe('Fornecedor Teste');
    });

    it('deve lançar erro quando a categoria está vazia', async () => {
      await expect(produtoService.buscarProdutosPorCategoria(''))
        .rejects.toThrow(CustomError);
      
      expect(mockRepository.listarProdutos).not.toHaveBeenCalled();
    });
  });

  describe('buscarProdutosPorCodigo', () => {
    it('deve buscar produtos pelo código', async () => {
      const codigo = 'PROD001';
      const mockProdutos = {
        docs: [{ nome_produto: 'Teclado RGB', codigo_produto: 'PROD001', id_fornecedor: 123 }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };
      
      mockRepository.listarProdutos.mockResolvedValue(mockProdutos);
      produtoService.enriquecerComNomesFornecedores = jest.fn().mockResolvedValue({
        ...mockProdutos,
        docs: [{ nome_produto: 'Teclado RGB', codigo_produto: 'PROD001', id_fornecedor: 123, nome_fornecedor: 'Fornecedor Teste' }]
      });

      const result = await produtoService.buscarProdutosPorCodigo(codigo);
      
      expect(mockRepository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: { codigo_produto: codigo, page: 1, limite: 10 }
      });
      expect(result.docs[0].nome_fornecedor).toBe('Fornecedor Teste');
    });

    it('deve lançar erro quando o código está vazio', async () => {
      await expect(produtoService.buscarProdutosPorCodigo(''))
        .rejects.toThrow(CustomError);
      
      expect(mockRepository.listarProdutos).not.toHaveBeenCalled();
    });
  });

  describe('buscarProdutosPorFornecedor', () => {
    it('deve buscar produtos pelo ID do fornecedor', async () => {
      const idFornecedor = '123';
      const mockProdutos = {
        docs: [{ nome_produto: 'Teclado RGB', id_fornecedor: 123 }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };
      
      mockRepository.listarProdutos.mockResolvedValue(mockProdutos);
      produtoService.enriquecerComNomesFornecedores = jest.fn().mockResolvedValue({
        ...mockProdutos,
        docs: [{ nome_produto: 'Teclado RGB', id_fornecedor: 123, nome_fornecedor: 'Fornecedor Teste' }]
      });

      const result = await produtoService.buscarProdutosPorFornecedor(idFornecedor);
      
      expect(mockRepository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: { id_fornecedor: idFornecedor, page: 1, limite: 10 }
      });
      expect(result.docs[0].nome_fornecedor).toBe('Fornecedor Teste');
    });

    it('deve buscar produtos pelo nome do fornecedor', async () => {
      const nomeFornecedor = 'Fornecedor A';
      const mockProdutos = {
        docs: [{ nome_produto: 'Teclado RGB', id_fornecedor: 123 }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };
      
      mockRepository.listarProdutos.mockResolvedValue(mockProdutos);
      produtoService.enriquecerComNomesFornecedores = jest.fn().mockResolvedValue({
        ...mockProdutos,
        docs: [{ nome_produto: 'Teclado RGB', id_fornecedor: 123, nome_fornecedor: 'Fornecedor A' }]
      });

      const result = await produtoService.buscarProdutosPorFornecedor(nomeFornecedor, 1, 10, true);
      
      expect(mockRepository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: { nome_fornecedor: nomeFornecedor, page: 1, limite: 10 }
      });
      expect(result.docs[0].nome_fornecedor).toBe('Fornecedor A');
    });

    it('deve lançar erro quando o fornecedor está vazio', async () => {
      await expect(produtoService.buscarProdutosPorFornecedor(''))
        .rejects.toThrow(CustomError);
      
      expect(mockRepository.listarProdutos).not.toHaveBeenCalled();
    });
  });

  describe('deletarProduto', () => {
    it('deve deletar um produto com sucesso', async () => {
      const id = '60d21b4667d0d8992e610c85';
      const mockProduto = { _id: id, nome_produto: 'Produto a Deletar' };
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockRepository.deletarProduto.mockResolvedValue(mockProduto);

      const result = await produtoService.deletarProduto(id);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.deletarProduto).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockProduto);
    });

    it('deve lançar erro quando o ID é inválido', async () => {
      const id = 'id_invalido';
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await expect(produtoService.deletarProduto(id))
        .rejects.toThrow(CustomError);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.deletarProduto).not.toHaveBeenCalled();
    });
  });

  describe('listarEstoqueBaixo', () => {
    it('deve listar produtos com estoque abaixo do mínimo', async () => {
      const mockProdutos = [
        { nome_produto: 'Produto Crítico', estoque: 5, estoque_min: 10, id_fornecedor: 123 }
      ];
      
      mockRepository.listarEstoqueBaixo.mockResolvedValue(mockProdutos);
      produtoService.enriquecerComNomesFornecedores = jest.fn().mockResolvedValue([
        { nome_produto: 'Produto Crítico', estoque: 5, estoque_min: 10, id_fornecedor: 123, nome_fornecedor: 'Fornecedor Teste' }
      ]);

      const result = await produtoService.listarEstoqueBaixo();
      
      expect(mockRepository.listarEstoqueBaixo).toHaveBeenCalled();
      expect(produtoService.enriquecerComNomesFornecedores).toHaveBeenCalledWith(mockProdutos);
      expect(result[0].nome_fornecedor).toBe('Fornecedor Teste');
    });
  });

  describe('desativarProduto', () => {
    it('deve desativar um produto com sucesso', async () => {
      const id = '60d21b4667d0d8992e610c85';
      const mockProduto = { _id: id, nome_produto: 'Produto Inativo', status: false };
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockRepository.desativarProduto.mockResolvedValue(mockProduto);

      const result = await produtoService.desativarProduto(id);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.desativarProduto).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockProduto);
      expect(result.status).toBe(false);
    });

    it('deve lançar erro quando o ID é inválido', async () => {
      const id = 'id_invalido';
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await expect(produtoService.desativarProduto(id))
        .rejects.toThrow(CustomError);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.desativarProduto).not.toHaveBeenCalled();
    });
  });

  describe('reativarProduto', () => {
    it('deve reativar um produto com sucesso', async () => {
      const id = '60d21b4667d0d8992e610c85';
      const mockProduto = { _id: id, nome_produto: 'Produto Reativado', status: true };
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockRepository.reativarProduto.mockResolvedValue(mockProduto);

      const result = await produtoService.reativarProduto(id);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.reativarProduto).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockProduto);
      expect(result.status).toBe(true);
    });

    it('deve lançar erro quando o ID é inválido', async () => {
      const id = 'id_invalido';
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await expect(produtoService.reativarProduto(id))
        .rejects.toThrow(CustomError);
      
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(id);
      expect(mockRepository.reativarProduto).not.toHaveBeenCalled();
    });
  });
});
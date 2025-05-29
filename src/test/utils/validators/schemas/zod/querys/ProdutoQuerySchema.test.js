import { ProdutoQuerySchema, ProdutoIdSchema } from '../../../../../../utils/validators/schemas/zod/querys/ProdutoQuerySchema.js';
import mongoose from 'mongoose';

describe('ProdutoQuerySchema', () => {
  describe('validações de ProdutoQuerySchema', () => {
    // Objeto base válido para testes
    const validQuery = {
      nome_produto: 'Teclado'
    };

    it('deve validar uma query com nome_produto', () => {
      expect(() => ProdutoQuerySchema.parse({ nome_produto: 'Teclado' })).not.toThrow();
    });

    it('deve validar uma query com categoria', () => {
      expect(() => ProdutoQuerySchema.parse({ categoria: 'Periféricos' })).not.toThrow();
    });

    it('deve validar uma query com codigo_produto', () => {
      expect(() => ProdutoQuerySchema.parse({ codigo_produto: 'PROD123' })).not.toThrow();
    });

    it('deve validar uma query com id_fornecedor', () => {
      expect(() => ProdutoQuerySchema.parse({ id_fornecedor: '60d21b4667d0d8992e610c85' })).not.toThrow();
    });

    it('deve validar uma query com nome_fornecedor', () => {
      expect(() => ProdutoQuerySchema.parse({ nome_fornecedor: 'Fornecedor A' })).not.toThrow();
    });

    it('deve validar uma query com múltiplos parâmetros', () => {
      const query = {
        nome_produto: 'Teclado',
        categoria: 'Periféricos',
        page: '1',
        limite: '20'
      };
      expect(() => ProdutoQuerySchema.parse(query)).not.toThrow();
    });

    it('deve validar uma query com paginação', () => {
      const query = {
        nome_produto: 'Teclado',
        page: '2',
        limite: '10'
      };
      expect(() => ProdutoQuerySchema.parse(query)).not.toThrow();
    });

    it('deve validar uma query com filtros de preço e estoque', () => {
      const query = {
        nome_produto: 'Teclado',
        preco_min: '50',
        preco_max: '200',
        estoque_min: '5'
      };
      expect(() => ProdutoQuerySchema.parse(query)).not.toThrow();
    });

    it('deve validar uma query com status', () => {
      const query = {
        nome_produto: 'Teclado',
        status: 'true'
      };
      expect(() => ProdutoQuerySchema.parse(query)).not.toThrow();
    });

    it('deve rejeitar uma query vazia', () => {
      expect(() => ProdutoQuerySchema.parse({})).toThrow(/parâmetro de busca/);
    });

    it('deve rejeitar uma query sem parâmetros de busca principais', () => {
      const queryApenasComPaginacao = {
        page: '1',
        limite: '10'
      };
      expect(() => ProdutoQuerySchema.parse(queryApenasComPaginacao)).toThrow(/parâmetro de busca/);
    });

    it('deve rejeitar uma query com parâmetros undefined', () => {
      const queryComParametrosUndefined = {
        nome_produto: undefined,
        categoria: undefined
      };
      expect(() => ProdutoQuerySchema.parse(queryComParametrosUndefined)).toThrow(/parâmetro de busca/);
    });
  });

  describe('validações de ProdutoIdSchema', () => {
    it('deve validar um ID MongoDB válido', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      expect(() => ProdutoIdSchema.parse(validId)).not.toThrow();
    });

    it('deve validar um ID no formato correto', () => {
      const validId = '60d21b4667d0d8992e610c85';
      expect(() => ProdutoIdSchema.parse(validId)).not.toThrow();
    });

    it('deve rejeitar um ID curto', () => {
      expect(() => ProdutoIdSchema.parse('123')).toThrow(/ID do produto inválido/);
    });

    it('deve rejeitar um ID com caracteres inválidos', () => {
      expect(() => ProdutoIdSchema.parse('60d21b4667d0z8992e610c85')).toThrow(/ID do produto inválido/);
    });

    it('deve rejeitar um ID vazio', () => {
      expect(() => ProdutoIdSchema.parse('')).toThrow(/ID do produto inválido/);
    });

    it('deve rejeitar um ID não-string', () => {
      // @ts-ignore - teste proposital de tipo inválido
      expect(() => ProdutoIdSchema.parse(123456)).toThrow();
    });
  });
});
import { FornecedorQuerySchema, FornecedorIdSchema } from '../../../../../../utils/validators/schemas/zod/querys/FornecedorQuerySchema.js';

describe('FornecedorQuerySchema', () => {
  describe('validações de FornecedorQuerySchema', () => {
    const validQuery = {
      nome: 'Fornecedor X'
    };

    it('deve validar uma query com nome', () => {
      expect(() => FornecedorQuerySchema.parse({ nome: 'Fornecedor X' })).not.toThrow();
    });

    it('deve validar uma query com categoria', () => {
      expect(() => FornecedorQuerySchema.parse({ nome: 'Fornecedor X', categoria: 'Alimentos' })).not.toThrow();
    });

    it('deve validar uma query com codigo_produto', () => {
      expect(() => FornecedorQuerySchema.parse({ nome: 'Fornecedor X', codigo_produto: 'PROD123' })).not.toThrow();
    });

    it('deve validar uma query com id_fornecedor', () => {
      expect(() => FornecedorQuerySchema.parse({ nome: 'Fornecedor X', id_fornecedor: '60d21b4667d0d8992e610c85' })).not.toThrow();
    });

    it('deve validar uma query com múltiplos parâmetros', () => {
      const query = {
        nome: 'Fornecedor X',
        categoria: 'Alimentos',
        page: '1',
        limite: '20'
      };
      expect(() => FornecedorQuerySchema.parse(query)).not.toThrow();
    });

    it('deve validar uma query com paginação', () => {
      const query = {
        nome: 'Fornecedor X',
        page: '2',
        limite: '10'
      };
      expect(() => FornecedorQuerySchema.parse(query)).not.toThrow();
    });

    it('deve validar uma query com filtros de preço e estoque', () => {
      const query = {
        nome: 'Fornecedor X',
        preco_min: '50',
        preco_max: '200',
        estoque_min: '5'
      };
      expect(() => FornecedorQuerySchema.parse(query)).not.toThrow();
    });

    it('deve validar uma query com status', () => {
      const query = {
        nome: 'Fornecedor X',
        status: 'true'
      };
      expect(() => FornecedorQuerySchema.parse(query)).not.toThrow();
    });

    it('deve rejeitar uma query sem nome', () => {
      expect(() => FornecedorQuerySchema.parse({})).toThrow(/nome/);
    });

    it('deve rejeitar uma query com nome vazio', () => {
      expect(() => FornecedorQuerySchema.parse({ nome: '' })).toThrow(/O nome para busca deve conter pelo menos 1 caractere/);
    });
  });

  describe('validações de FornecedorIdSchema', () => {
    it('deve validar um ID MongoDB válido', () => {
      const validId = '60d21b4667d0d8992e610c85';
      expect(() => FornecedorIdSchema.parse(validId)).not.toThrow();
    });

    it('deve rejeitar um ID curto', () => {
      expect(() => FornecedorIdSchema.parse('123')).toThrow(/ID do produto inválido/);
    });

    it('deve rejeitar um ID com caracteres inválidos', () => {
      expect(() => FornecedorIdSchema.parse('60d21b4667d0z8992e610c85')).toThrow(/ID do produto inválido/);
    });

    it('deve rejeitar um ID vazio', () => {
      expect(() => FornecedorIdSchema.parse('')).toThrow(/ID do produto inválido/);
    });

    it('deve rejeitar um ID não-string', () => {
      // @ts-ignore - teste proposital de tipo inválido
      expect(() => FornecedorIdSchema.parse(123456)).toThrow();
    });
  });
});

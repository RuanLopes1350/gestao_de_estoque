import { ProdutoSchema, ProdutoUpdateSchema } from '../../../../../utils/validators/schemas/zod/ProdutoSchema.js';

describe('ProdutoSchema', () => {
  // Objeto base válido para testes
  const validProduto = {
    nome_produto: 'Produto Teste',
    descricao: 'Descrição Teste',
    preco: 399.99,
    marca: 'Marca Teste',
    custo: 199.99,
    categoria: 'C',
    estoque: 50,
    estoque_min: 10,
    data_ultima_entrada: new Date(),
    status: true,
    id_fornecedor: 123,
    codigo_produto: 'PROD001'
  };

  describe('validações de ProdutoSchema', () => {
    it('deve validar um produto com dados válidos', () => {
      expect(() => ProdutoSchema.parse(validProduto)).not.toThrow();
    });

    it('deve validar um produto com data_ultima_entrada como string ISO', () => {
      const produto = { 
        ...validProduto, 
        data_ultima_entrada: new Date().toISOString() 
      };
      expect(() => ProdutoSchema.parse(produto)).not.toThrow();
    });

    it('deve validar um produto sem campos opcionais', () => {
        const produtoSemOpcionais = {
          nome_produto: 'Produto Test',
          preco: 399.99,
          custo: 199.99,
          categoria: 'C',
          estoque: 50,
          estoque_min: 10,
          id_fornecedor: 123,
          codigo_produto: 'PROD001',
          data_ultima_entrada: undefined
        };
        expect(() => ProdutoSchema.parse(produtoSemOpcionais)).not.toThrow();
      });

    it('deve rejeitar um produto sem nome_produto', () => {
      const produto = { ...validProduto };
      delete produto.nome_produto;
      expect(() => ProdutoSchema.parse(produto)).toThrow(/nome_produto/);
    });

    it('deve rejeitar um produto com nome_produto muito curto', () => {
      const produto = { ...validProduto, nome_produto: 'AB' };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/Nome do produto deve ter pelo menos 3 caracteres/);
    });

    it('deve rejeitar um produto com preço negativo', () => {
      const produto = { ...validProduto, preco: -10 };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/Preço deve ser um valor positivo/);
    });

    it('deve rejeitar um produto com custo negativo', () => {
      const produto = { ...validProduto, custo: -5 };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/Custo deve ser um valor positivo/);
    });

    it('deve rejeitar um produto sem categoria', () => {
      const produto = { ...validProduto };
      delete produto.categoria;
      expect(() => ProdutoSchema.parse(produto)).toThrow(/categoria/);
    });

    it('deve rejeitar um produto com estoque não inteiro', () => {
      const produto = { ...validProduto, estoque: 10.5 };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/Estoque deve ser um número inteiro/);
    });

    it('deve rejeitar um produto com estoque negativo', () => {
      const produto = { ...validProduto, estoque: -5 };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/Estoque não pode ser negativo/);
    });

    it('deve rejeitar um produto com estoque_min não inteiro', () => {
      const produto = { ...validProduto, estoque_min: 5.5 };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/Estoque mínimo deve ser um número inteiro/);
    });

    it('deve rejeitar um produto com estoque_min negativo', () => {
      const produto = { ...validProduto, estoque_min: -2 };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/Estoque mínimo não pode ser negativo/);
    });

    it('deve rejeitar um produto com id_fornecedor não inteiro', () => {
        const produto = { ...validProduto, id_fornecedor: 1.5 };
        expect(() => ProdutoSchema.parse(produto)).toThrow();
      });

    it('deve rejeitar um produto com id_fornecedor não positivo', () => {
      const produto = { ...validProduto, id_fornecedor: 0 };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/ID do fornecedor deve ser um número inteiro positivo/);
    });

    it('deve rejeitar um produto sem codigo_produto', () => {
      const produto = { ...validProduto };
      delete produto.codigo_produto;
      expect(() => ProdutoSchema.parse(produto)).toThrow(/codigo_produto/);
    });

    it('deve rejeitar um produto com codigo_produto muito curto', () => {
      const produto = { ...validProduto, codigo_produto: 'AB' };
      expect(() => ProdutoSchema.parse(produto)).toThrow(/Código do produto deve ter pelo menos 3 caracteres/);
    });

    it('deve rejeitar um produto com data_ultima_entrada inválida', () => {
      const produto = { ...validProduto, data_ultima_entrada: 'data-invalida' };
      expect(() => ProdutoSchema.parse(produto)).toThrow();
    });
  });

  describe('validações de ProdutoUpdateSchema', () => {
    it('deve validar uma atualização completa', () => {
      expect(() => ProdutoUpdateSchema.parse(validProduto)).not.toThrow();
    });

    it('deve validar uma atualização parcial com apenas um campo', () => {
      expect(() => ProdutoUpdateSchema.parse({ nome_produto: 'Novo Nome' })).not.toThrow();
      expect(() => ProdutoUpdateSchema.parse({ preco: 299.99 })).not.toThrow();
      expect(() => ProdutoUpdateSchema.parse({ estoque: 30 })).not.toThrow();
      expect(() => ProdutoUpdateSchema.parse({ status: false })).not.toThrow();
    });

    it('deve validar uma atualização com múltiplos campos', () => {
      const atualizacao = {
        preco: 279.99,
        estoque: 25,
        marca: 'Marca Teste'
      };
      expect(() => ProdutoUpdateSchema.parse(atualizacao)).not.toThrow();
    });

    it('deve rejeitar valores inválidos mesmo em atualizações parciais', () => {
      expect(() => ProdutoUpdateSchema.parse({ preco: -10 })).toThrow(/Preço deve ser um valor positivo/);
      expect(() => ProdutoUpdateSchema.parse({ estoque: -5 })).toThrow(/Estoque não pode ser negativo/);
      expect(() => ProdutoUpdateSchema.parse({ nome_produto: 'AB' })).toThrow(/Nome do produto deve ter pelo menos 3 caracteres/);
    });

    it('deve aceitar um objeto vazio como válido', () => {
      expect(() => ProdutoUpdateSchema.parse({})).not.toThrow();
    });

    it('deve rejeitar valores de tipo incorreto', () => {
      expect(() => ProdutoUpdateSchema.parse({ preco: 'não é um número' })).toThrow();
      expect(() => ProdutoUpdateSchema.parse({ estoque: '10' })).toThrow();
      expect(() => ProdutoUpdateSchema.parse({ status: 'sim' })).toThrow();
    });
  });

  describe('transformações de dados', () => {
    it('deve permitir data_ultima_entrada como string e convertê-la para Date', () => {
      const dataISO = '2023-05-15T10:30:00.000Z';
      const produto = { ...validProduto, data_ultima_entrada: dataISO };
      const resultado = ProdutoSchema.parse(produto);
      
      expect(resultado.data_ultima_entrada instanceof Date).toBe(true);
      expect(resultado.data_ultima_entrada.toISOString()).toBe(dataISO);
    });
  
    it('deve manter o Date original se data_ultima_entrada for um objeto Date', () => {
      const data = new Date();
      const produto = { ...validProduto, data_ultima_entrada: data };
      const resultado = ProdutoSchema.parse(produto);
      
      expect(resultado.data_ultima_entrada.getTime()).toBe(data.getTime());
    });
  });
});
import { FornecedorSchema } from '../../utils/validators/FornecedorSchema.js';

describe('FornecedorSchema', () => {
  const validFornecedor = {
    nome_fornecedor: 'Fornecedor Teste',
    cnpj: '12345678000199',
    telefone: '1199999999',
    email: 'fornecedor@teste.com',
    endereco: [
      {
        logradouro: 'Rua Teste',
        bairro: 'Bairro Teste',
        cidade: 'Cidade Teste',
        estado: 'SP',
        cep: '12345678'
      }
    ]
  };

  it('deve validar um fornecedor com dados válidos', () => {
    expect(() => FornecedorSchema.parse(validFornecedor)).not.toThrow();
  });

  it('deve rejeitar fornecedor sem nome_fornecedor', () => {
    const f = { ...validFornecedor };
    delete f.nome_fornecedor;
    expect(() => FornecedorSchema.parse(f)).toThrow(/nome_fornecedor/);
  });

  it('deve rejeitar nome_fornecedor muito curto', () => {
    const f = { ...validFornecedor, nome_fornecedor: 'AB' };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Nome do fornecedor deve ter pelo menos 3 caracteres/);
  });

  it('deve rejeitar cnpj com tamanho incorreto', () => {
    const f = { ...validFornecedor, cnpj: '123' };
    expect(() => FornecedorSchema.parse(f)).toThrow(/CNPJ deve conter exatamente 14 caracteres/);
  });

  it('deve rejeitar cnpj com caracteres não numéricos', () => {
    const f = { ...validFornecedor, cnpj: '12345678abcd99' };
    expect(() => FornecedorSchema.parse(f)).toThrow(/CNPJ deve conter apenas números/);
  });

  it('deve rejeitar telefone com tamanho incorreto', () => {
    const f = { ...validFornecedor, telefone: '123' };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Telefone deve conter exatamente 10 caracteres/);
  });

  it('deve rejeitar telefone com caracteres não numéricos', () => {
    const f = { ...validFornecedor, telefone: '11999abcde' };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Telefone deve conter apenas números/);
  });

  it('deve rejeitar email inválido', () => {
    const f = { ...validFornecedor, email: 'emailinvalido' };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Email inválido/);
  });

  it('deve rejeitar email muito curto', () => {
    const f = { ...validFornecedor, email: 'a@b.c' };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Email deve conter no mínimo 5 caracteres/);
  });

  it('deve rejeitar email muito longo', () => {
    const f = { ...validFornecedor, email: 'a'.repeat(95) + '@mail.com' };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Email deve conter no máximo 100 caracteres/);
  });

  it('deve rejeitar fornecedor sem endereço', () => {
    const f = { ...validFornecedor };
    delete f.endereco;
    expect(() => FornecedorSchema.parse(f)).toThrow(/Endereço não pode estar vazio/);
  });

  it('deve rejeitar endereço vazio', () => {
    const f = { ...validFornecedor, endereco: [] };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Endereço não pode estar vazio/);
  });

  it('deve rejeitar endereço com logradouro muito curto', () => {
    const f = { ...validFornecedor, endereco: [{ ...validFornecedor.endereco[0], logradouro: 'AB' }] };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Logradouro deve ter pelo menos 3 caracteres/);
  });

  it('deve rejeitar endereço com bairro muito curto', () => {
    const f = { ...validFornecedor, endereco: [{ ...validFornecedor.endereco[0], bairro: 'AB' }] };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Bairro deve ter pelo menos 3 caracteres/);
  });

  it('deve rejeitar endereço com cidade muito curta', () => {
    const f = { ...validFornecedor, endereco: [{ ...validFornecedor.endereco[0], cidade: 'AB' }] };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Cidade deve ter pelo menos 3 caracteres/);
  });

  it('deve rejeitar endereço com estado diferente de 2 caracteres', () => {
    const f = { ...validFornecedor, endereco: [{ ...validFornecedor.endereco[0], estado: 'S' }] };
    expect(() => FornecedorSchema.parse(f)).toThrow(/Estado deve conter exatamente 2 caracteres/);
  });

  it('deve rejeitar endereço com cep não numérico', () => {
    const f = { ...validFornecedor, endereco: [{ ...validFornecedor.endereco[0], cep: '1234abcd' }] };
    expect(() => FornecedorSchema.parse(f)).toThrow(/CEP deve conter apenas números/);
  });
});

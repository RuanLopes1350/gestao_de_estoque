import mongoose from 'mongoose';
import Fornecedor from '../../models/Fornecedor';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  jest.clearAllMocks();
  await Fornecedor.deleteMany({});
});

describe('Modelo de Fornecedor', () => {
  it('deve criar um fornecedor com dados válidos', async () => {
    const fornecedorData = {
      nome_fornecedor: 'Fornecedor Teste',
      cnpj: '12345678000199',
      telefone: '11999999999',
      email: 'fornecedor@exemplo.com',
      endereco: [
        {
          logradouro: 'Rua Exemplo',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000',
        },
      ],
    };

    const fornecedor = new Fornecedor(fornecedorData);
    await fornecedor.save();

    const saved = await Fornecedor.findById(fornecedor._id);
    expect(saved.nome_fornecedor).toBe(fornecedorData.nome_fornecedor);
    expect(saved.cnpj).toBe(fornecedorData.cnpj);
    expect(saved.telefone).toBe(fornecedorData.telefone);
    expect(saved.email).toBe(fornecedorData.email);
    expect(saved.endereco).toHaveLength(1);
    expect(saved.endereco[0].cidade).toBe('São Paulo');
  });

  it('deve falhar ao criar um fornecedor sem nome', async () => {
    const fornecedorData = {
      cnpj: '12345678000199',
      telefone: '11999999999',
      email: 'fornecedor@exemplo.com',
      endereco: [
        {
          logradouro: 'Rua Exemplo',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000',
        },
      ],
    };

    const fornecedor = new Fornecedor(fornecedorData);
    await expect(fornecedor.save()).rejects.toThrowErrorMatchingSnapshot();
  });

  it('deve falhar ao criar um fornecedor sem CNPJ', async () => {
    const fornecedorData = {
      nome_fornecedor: 'Fornecedor Teste',
      telefone: '11999999999',
      email: 'fornecedor@exemplo.com',
      endereco: [
        {
          logradouro: 'Rua Exemplo',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000',
        },
      ],
    };

    const fornecedor = new Fornecedor(fornecedorData);
    await expect(fornecedor.save()).rejects.toThrowErrorMatchingSnapshot();
  });

  it('deve falhar se algum campo do endereço estiver ausente', async () => {
    const fornecedorData = {
      nome_fornecedor: 'Fornecedor Teste',
      cnpj: '12345678000199',
      telefone: '11999999999',
      email: 'fornecedor@exemplo.com',
      endereco: [
        {
          logradouro: 'Rua Exemplo',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
        },
      ],
    };

    const fornecedor = new Fornecedor(fornecedorData);
    await expect(fornecedor.save()).rejects.toThrowErrorMatchingSnapshot();
  });
});

import { faker } from '@faker-js/faker/locale/pt_BR';
import mongoose from 'mongoose';
// Importe todos os modelos necessários
import Usuario from '../models/Usuario.js';
import Fornecedor from '../models/Fornecedor.js';
import Produto from '../models/Produto.js';
import Movimentacao from '../models/Movimentacao.js';

// Função para verificar se um modelo existe e está corretamente definido
function isValidModel(model) {
    return model && model.schema && model.schema.paths;
}

// Função para obter os nomes dos campos de um schema
function getSchemaFieldNames(model) {
    // Adicione verificação para evitar o erro
    if (!isValidModel(model)) {
        console.warn(`Aviso: Modelo ${model?.modelName || 'desconhecido'} não está definido corretamente.`);
        return [];
    }
    
    return Object.keys(model.schema.paths).filter(path => !path.startsWith('_'));
}

// Função para validar o mapeamento contra o modelo
function validateModelMapping(model, mapping) {
    // Pule a validação se o modelo não estiver disponível
    if (!isValidModel(model)) {
        console.warn(`Pulando validação para modelo não disponível`);
        return true;
    }
    
    const schemaFields = getSchemaFieldNames(model);
    const mappingFields = Object.keys(mapping);
    
    // Verifica se todos os campos do mapeamento existem no schema
    const invalidFields = mappingFields.filter(field => !schemaFields.includes(field));
    if (invalidFields.length > 0) {
        console.warn(`Aviso: Campos inválidos no mapeamento: ${invalidFields.join(', ')}`);
    }
    
    return true;
}

// Mapeamento dos modelos para suas funções de geração de dados falsos
const modelMappings = [
    { model: Usuario, mapping: 'usuario' },
    { model: Fornecedor, mapping: 'fornecedor' },
    { model: Produto, mapping: 'produto' },
    { model: Movimentacao, mapping: 'movimentacao' },
];

function validateAllMappings(fakeMapping) {
    modelMappings.forEach(({ model, mapping }) => {
        // Somente validar se o mapeamento existe
        if (fakeMapping[mapping]) {
            validateModelMapping(model, fakeMapping[mapping]);
        }
    });
}

function getGlobalFakeMapping() {
    faker.locale = 'pt_BR';
    
    const fakeMapping = {
        usuario: {
            nome_usuario: () => faker.internet.userName(),
            matricula: () => faker.string.alphanumeric(6).toUpperCase(),
            senha: () => faker.internet.password(15),
            cargo: () => faker.helpers.arrayElement(['Gerente', 'Assistente', 'Operador', 'Analista', 'Supervisor']),
            data_cadastro: () => faker.date.past(),
            data_ultima_atualizacao: () => faker.date.recent(),
        },
        fornecedor: {
            nome_fornecedor: () => faker.company.name(),
            cnpj: () => faker.string.numeric(14),
            endereco: () => [{ 
                telefone: faker.phone.number(),
                email: faker.internet.email()
            }]
        },
        produto: {
            nome_produto: () => faker.commerce.productName(),
            descricao: () => faker.commerce.productDescription(),
            preco: () => parseFloat(faker.commerce.price()),
            marca: () => faker.company.name(),
            custo: () => parseFloat(faker.commerce.price({ min: 50, max: 200 })),
            categoria: () => faker.helpers.arrayElement(['Eletrônicos', 'Alimentos', 'Vestuário', 'Higiene', 'Limpeza']),
            estoque: () => faker.number.int({ min: 0, max: 1000 }),
            estoque_min: () => faker.number.int({ min: 5, max: 50 }),
            data_ultima_entrada: () => faker.date.recent(),
            data_ultima_saida: () => faker.date.past(),
            status: () => faker.datatype.boolean(),
            id_fornecedor: () => faker.number.int({ min: 1, max: 100 }),
            codigo_produto: () => faker.string.alphanumeric(10).toUpperCase(),
        },
        movimentacao: {
            tipo: () => faker.helpers.arrayElement(['entrada', 'saida']),
            destino: () => faker.company.name(),
            data_movimentacao: () => faker.date.recent(),
            id_usuario: () => new mongoose.Types.ObjectId(),
            nome_usuario: () => faker.internet.userName(),
            produtos: {
                produto_ref: () => new mongoose.Types.ObjectId(),
                id_produto: () => faker.number.int({ min: 1, max: 1000 }),
                codigo_produto: () => faker.string.alphanumeric(10).toUpperCase(),
                nome_produto: () => faker.commerce.productName(),
                quantidade_produtos: () => faker.number.int({ min: 1, max: 100 }),
                preco: () => parseFloat(faker.commerce.price()),
                custo: () => parseFloat(faker.commerce.price({ min: 50, max: 200 })),
                id_fornecedor: () => faker.number.int({ min: 1, max: 100 }),
                nome_fornecedor: () => faker.company.name(),
            }
        }
    };

    // Valide os mapeamentos, ignorando erros
    try {
        validateAllMappings(fakeMapping);
    } catch (error) {
        console.warn('Aviso: Erro na validação do mapeamento:', error.message);
    }
    
    return fakeMapping;
}

export default getGlobalFakeMapping;
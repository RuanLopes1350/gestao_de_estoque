import { faker } from '@faker-js/faker/locale/pt_BR';
import { fakerPT_BR } from '@faker-js/faker';
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
    
    const fakeMapping = {
        usuario: {
            nome_usuario: () => fakerPT_BR.person.fullName(),
            matricula: () => fakerPT_BR.string.alphanumeric(6).toUpperCase(),
            senha: () => fakerPT_BR.internet.password(15),
            cargo: () => fakerPT_BR.helpers.arrayElement(['Gerente', 'Assistente', 'Operador', 'Analista', 'Supervisor']),
            data_cadastro: () => fakerPT_BR.date.past(),
            data_ultima_atualizacao: () => fakerPT_BR.date.recent(),
        },
        fornecedor: {
            nome_fornecedor: () => fakerPT_BR.company.name(),
            cnpj: () => fakerPT_BR.string.numeric(14),
            endereco: () => [{ 
                telefone: fakerPT_BR.phone.number(),
                email: fakerPT_BR.internet.email()
            }]
        },
        produto: {
            nome_produto: () => fakerPT_BR.commerce.productName(),
            descricao: () => fakerPT_BR.commerce.productDescription(),
            preco: () => parseFloat(fakerPT_BR.commerce.price({min: 15, max: 10000})),
            marca: () => fakerPT_BR.company.name(),
            custo: () => parseFloat(fakerPT_BR.commerce.price({ min: 5, max: 8000 })),
            categoria: function() {
                if (this.preco >= 1001.00) {
                    return 'A';
                }
                else if (this.preco >= 500.00) {
                    return 'B';
                }
                else {
                    return 'C';
                }
            },
            estoque: () => fakerPT_BR.number.int({ min: 0, max: 1000 }),
            estoque_min: () => fakerPT_BR.number.int({ min: 5, max: 50 }),
            data_ultima_entrada: () => fakerPT_BR.date.recent(),
            status: () => fakerPT_BR.datatype.boolean(),
            id_fornecedor: () => fakerPT_BR.number.int({ min: 1, max: 100 }),
            codigo_produto: () => fakerPT_BR.string.alphanumeric(10).toUpperCase(),
        },
        movimentacao: {
            tipo: () => fakerPT_BR.helpers.arrayElement(['entrada', 'saida']),
            destino: () => fakerPT_BR.company.name(),
            data_movimentacao: () => fakerPT_BR.date.recent(),
            id_usuario: () => new mongoose.Types.ObjectId(),
            nome_usuario: () => fakerPT_BR.internet.userName(),
            produtos: {
                produto_ref: () => new mongoose.Types.ObjectId(),
                id_produto: () => fakerPT_BR.number.int({ min: 1, max: 1000 }),
                codigo_produto: () => fakerPT_BR.string.alphanumeric(10).toUpperCase(),
                nome_produto: () => fakerPT_BR.commerce.productName(),
                quantidade_produtos: () => fakerPT_BR.number.int({ min: 1, max: 100 }),
                preco: () => parseFloat(fakerPT_BR.commerce.price()),
                custo: () => parseFloat(fakerPT_BR.commerce.price({ min: 50, max: 200 })),
                id_fornecedor: () => fakerPT_BR.number.int({ min: 1, max: 100 }),
                nome_fornecedor: () => fakerPT_BR.company.name(),
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
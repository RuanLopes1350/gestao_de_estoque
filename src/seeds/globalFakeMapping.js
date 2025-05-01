import fakebr from 'faker-br';
import TokenUtil from '../utils/TokenUtil.js';
import loadModels from './loadModels.js';
import { Usuario } from '../models/Usuario.js';
import { Movimentacao } from '../models/Movimentacao.js';

const fakeMappings = {
    produto: {
        nome_produto: () => fakebr.commerce.productName(),
        descricao: () => fakebr.commerce.productDescription(),
        preco: () => fakebr.commerce.price(),
        marca: () => fakebr.commerce.productAdjective(),
        custo: () => fakebr.commerce.price(),
        categoria: () => fakebr.random.arrayElement(['A', 'B', 'C']),
        estoque: () => fakebr.random.number({ min: 1, max: 100 }),
        estoque_min: () => fakebr.random.number({ min: 1, max: 10 }),
        data_ultima_entrada: () => fakebr.date.past(),
        data_ultima_saida: () => fakebr.date.past(),
        status: () => fakebr.random.boolean(),
        id_fornecedor: () => fakebr.random.number({ min: 1, max: 100 }),
        codigo_produto: () => fakebr.random.alphaNumeric(10),
    },
    usuario: {
        nome: () => fakebr.name.fullName(),
        matricula: () => fakerbr.random.number({ min: 1000, max: 9999 }).toString(),
        senha: () => fakebr.internet.password(),
        cargo: () => fakebr.random.arrayElement(['Gerente Geral', 'Gerente de Estoque', 'Estoquista', 'Vendedor']),
        data_cadastro: () => fakebr.date.past(),
        data_ultima_atualizacao: () => fakebr.date.past(),
    },
    fornecedor: {
        nome: () => fakebr.company.companyName(),
        cnpj: () => fakebr.br.cpf(),
        endereco: () => fakebr.address.streetAddress(),
        contato: () => [{
            telefone: () => fakebr.phone.phoneNumber(),
            email: () => fakebr.internet.email(),
        }
        ]
    },
    movimentacao: {
        tipo: () => fakebr.random.arrayElement(['entrada', 'saida', 'ajuste', 'transferencia']),
        destino: () => fakebr.random.arrayElement(['estoque', 'venda', 'transferencia']),
        data_movimentacao: () => fakebr.date.past(),
        id_usuario: () => new mongoose.Types.ObjectId().toString(),
        produtos: () => [
            {
                produto_ref: () => new mongoose.Types.ObjectId().toString(),
                id_produto: () => fakebr.random.number({ min: 1, max: 100 }),
                codigo_produto: () => fakebr.random.alphaNumeric(10),
                nome_produto: () => fakebr.commerce.productName(),
                quantidade_produtos: () => fakebr.random.number({ min: 1, max: 100 }),
                preco: () => fakebr.commerce.price(),
                custo: () => fakebr.commerce.price(),
                id_fornecedor: () => fakebr.random.number({ min: 1, max: 100 }),
                nome_fornecedor: () => fakebr.company.companyName(),
            },
        ],
    }
}

export async function getGlobalFakeMapping() {
    const models = await loadModels();
    let globalMapping = { ...fakeMappings.common };

    models.forEach(({ name }) => {
        if (fakeMappings[name]) {
            globalMapping = {
                ...globalMapping,
                ...fakeMappings[name],
            };
        }
    });

    return globalMapping;
}

/**
 * Função auxiliar para extrair os nomes dos campos de um schema,
 * considerando apenas os níveis superiores (campos aninhados são verificados pela parte antes do ponto).
 */
function getSchemaFieldNames(schema) {
    const fieldNames = new Set();
    Object.keys(schema.paths).forEach((key) => {
        if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) return;
        const topLevel = key.split('.')[0];
        fieldNames.add(topLevel);
    });
    return Array.from(fieldNames);
}

/**
 * Valida se o mapping fornecido cobre todos os campos do model.
 * Retorna um array com os nomes dos campos que estiverem faltando.
 */
function validateModelMapping(model, modelName, mapping) {
    const fields = getSchemaFieldNames(model.schema);
    const missing = fields.filter((field) => !(field in mapping));
    if (missing.length > 0) {
        console.error(
            `Model ${modelName} está faltando mapeamento para os campos: ${missing.join(', ')}`
        );
    } else {
        console.log(`Model ${modelName} possui mapeamento para todos os campos.`);
    }
    return missing;
}

/**
 * Executa a validação para os models fornecidos, utilizando o mapping específico de cada um.
 */
async function validateAllMappings() {
    const models = await loadModels();
    let totalMissing = {};

    models.forEach(({ model, name }) => {
        // Combina os campos comuns com os específicos de cada model
        const mapping = {
            ...fakeMappings.common,
            ...(fakeMappings[name] || {}),
        };
        const missing = validateModelMapping(model, name, mapping);
        if (missing.length > 0) {
            totalMissing[name] = missing;
        }
    });

    if (Object.keys(totalMissing).length === 0) {
        console.log('globalFakeMapping cobre todos os campos de todos os models.');
        return true;
    } else {
        console.warn('Faltam mapeamentos para os seguintes models:', totalMissing);
        return false;
    }
}

// Executa a validação antes de prosseguir com o seeding ou outras operações
validateAllMappings()
    .then((valid) => {
        if (valid) {
            console.log('Podemos acessar globalFakeMapping com segurança.');
            // Prossegue com o seeding ou outras operações
        } else {
            throw new Error('globalFakeMapping não possui todos os mapeamentos necessários.');
        }
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

export default getGlobalFakeMapping;
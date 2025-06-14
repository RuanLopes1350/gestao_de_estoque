// /src/seeds/globalFakeMapping.js

import fakebr from 'faker-br';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import TokenUtil from '../utils/TokenUtil.js';
import loadModels from './loadModels.js';

/**
 * Estrutura de mappings organizada por model.
 */
const fakeMappings = {
  // Campos comuns a vários models
  common: {
    nome: () =>
      fakebr.name.firstName() +
      " " +
      fakebr.name.lastName() +
      " " +
      fakebr.name.lastName(),
    email: () => fakebr.internet.email(),
    senha: () => fakebr.internet.password(),
    link_foto: () => fakebr.internet.url() + "/" + uuid() + ".jpg",
    ativo: () => true,
    tokenUnico: () =>
      TokenUtil.generateAccessToken(new mongoose.Types.ObjectId().toString()),
    refreshtoken: () =>
      TokenUtil.generateRefreshToken(new mongoose.Types.ObjectId().toString()),
    accesstoken: () =>
      TokenUtil.generateAccessToken(new mongoose.Types.ObjectId().toString()),
    descricao: () => fakebr.lorem.sentence(),
    localidade: () => fakebr.address.city() + " - " + fakebr.address.state(),
    rota: () => fakebr.lorem.word(10),
    dominio: () => fakebr.internet.url(),
    // Arrays de referências
    unidades: () => [{ _id: new mongoose.Types.ObjectId().toString() }],
    grupos: () => [{ _id: new mongoose.Types.ObjectId().toString() }],
    // Permissões (objeto complexo)
    permissoes: () => [
      {
        rota: fakebr.lorem.word(),
        dominio: fakebr.internet.url(),
        ativo: fakebr.random.boolean(),
        buscar: fakebr.random.boolean(),
        enviar: fakebr.random.boolean(),
        substituir: fakebr.random.boolean(),
        modificar: fakebr.random.boolean(),
        excluir: fakebr.random.boolean(),
      },
    ],
    codigo_recupera_senha: () =>
      fakebr.random.alphaNumeric(10).toUpperCase(),
    exp_codigo_recupera_senha: () =>
      fakebr.date.future({ minutes: 60 }),

    // Campos para versionamento e permissões simples
    buscar: () => fakebr.random.boolean(),
    enviar: () => fakebr.random.boolean(),
    substituir: () => fakebr.random.boolean(),
    modificar: () => fakebr.random.boolean(),
    excluir: () => fakebr.random.boolean(),
  },

  // Mapping específico para o model Curso
  Curso: {
    contra_turnos: () => ({
      segunda: fakebr.random.boolean(),
      terca: fakebr.random.boolean(),
      quarta: fakebr.random.boolean(),
      quinta: fakebr.random.boolean(),
      sexta: fakebr.random.boolean(),
      sabado: fakebr.random.boolean(),
      domingo: fakebr.random.boolean(),
    }),
    codigo: () =>
      fakebr.random.number({ min: 1000, max: 9999 }).toString(),
  },

  // Mapping específico para o model Estagio
  Estagio: {
    descricao: () => fakebr.lorem.sentence(),
    estudante: () => new mongoose.Types.ObjectId().toString(),
    data_inicio: () => fakebr.date.past(),
    data_termino: () => fakebr.date.future(),
    contra_turnos: () => ({
      segunda: fakebr.random.boolean(),
      terca: fakebr.random.boolean(),
      quarta: fakebr.random.boolean(),
      quinta: fakebr.random.boolean(),
      sexta: fakebr.random.boolean(),
      sabado: fakebr.random.boolean(),
      domingo: fakebr.random.boolean(),
    }),
    status: () => {
      const values = ["ativo", "inativo", "cancelado", "suspenso"];
      return values[Math.floor(Math.random() * values.length)];
    },
  },

  // Mapping específico para o model Estudante
  Estudante: {
    matricula: () => fakebr.random.number().toString(),
    nome: () =>
      fakebr.name.firstName() +
      " " +
      fakebr.name.lastName() +
      " " +
      fakebr.name.lastName(),
    ativo: () => fakebr.random.boolean(),
    cursos_id: () => new mongoose.Types.ObjectId().toString(),
    turma_id: () => new mongoose.Types.ObjectId().toString(),
  },

  // Mapping específico para o model Projeto
  Projeto: {
    descricao: () => fakebr.lorem.sentence(),
    professor_responsavel: () =>
      fakebr.name.firstName() +
      " " +
      fakebr.name.lastName() +
      " " +
      fakebr.name.lastName(),
    data_inicio: () => fakebr.date.past(),
    data_termino: () => fakebr.date.future(),
    contra_turnos: () => ({
      segunda: fakebr.random.boolean(),
      terca: fakebr.random.boolean(),
      quarta: fakebr.random.boolean(),
      quinta: fakebr.random.boolean(),
      sexta: fakebr.random.boolean(),
      sabado: fakebr.random.boolean(),
      domingo: fakebr.random.boolean(),
    }),
    lista_estudantes: () => [
      {
        estudante: new mongoose.Types.ObjectId().toString(),
        ativo: fakebr.random.boolean(),
      },
    ],
  },

  // Mapping específico para o model Refeicao
  Refeicao: {
    estudante: () => new mongoose.Types.ObjectId().toString(),
    data: () => fakebr.date.past(),
    tipoRefeicao: () => fakebr.lorem.word(),
    usuarioRegistrou: () => new mongoose.Types.ObjectId().toString(),
  },

  // Mapping específico para o model RefeicaoTurma
  RefeicaoTurma: {
    turma: () => new mongoose.Types.ObjectId().toString(),
    data_inicial: () => fakebr.date.past(),
    data_final: () => fakebr.date.future(),
    contra_turnos: () => ({
      segunda: fakebr.random.boolean(),
      terca: fakebr.random.boolean(),
      quarta: fakebr.random.boolean(),
      quinta: fakebr.random.boolean(),
      sexta: fakebr.random.boolean(),
      sabado: fakebr.random.boolean(),
      domingo: fakebr.random.boolean(),
    }),
  },

  // Mapping específico para o model Turma
  Turma: {
    codigo_suap: () => fakebr.random.alphaNumeric(6),
    curso: () => new mongoose.Types.ObjectId().toString(),
  },

  // Mapping para o model Supplier
  Supplier: {
    nome: () =>
      fakebr.name.firstName() +
      " " +
      fakebr.name.lastName() +
      " " +
      fakebr.name.lastName(),
    email: () => fakebr.internet.email(),
    ativo: () => fakebr.random.boolean(),
    cnpj: () => fakebr.br.cpf(),
    telefone: () => fakebr.phone.phoneNumber(),
    endereco: () => ({
      logradouro: fakebr.address.streetName(),
      numero: fakebr.random.number({ min: 1, max: 9999 }),
      complemento: fakebr.address.secondaryAddress(),
      bairro: fakebr.address.streetName(),
      cidade: fakebr.address.city(),
      estado: fakebr.address.state(),
      cep: fakebr.address.zipCode(),
    }),
  },

  // Mapping para model example
  Example: {
    nome: () =>
      fakebr.name.firstName() +
      " " +
      fakebr.name.lastName() +
      " " +
      fakebr.name.lastName(),
    descricao: () => fakebr.lorem.sentence(),
    codigo: () => fakebr.random.alphaNumeric(6),
  },
};

/**
 * Retorna o mapping global, consolidando os mappings comuns e específicos.
 * Nesta versão automatizada, carregamos os models e combinamos o mapping comum com o mapping específico de cada model.
 */
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

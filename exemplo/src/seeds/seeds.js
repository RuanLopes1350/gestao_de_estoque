import "dotenv/config";
import mongoose from "mongoose";

// Se você usa @faker-js/faker:
import { faker } from "@faker-js/faker";

// Se quiser faker em pt-BR, pode usar:
// import { faker } from "@faker-js/faker/locale/pt_BR";

// Dependências
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomBytes as _randomBytes } from "crypto";

// Conexão com banco
import DbConect from "../config/DbConnect.js";

// Models principais
import Grupo from "../models/Grupo.js";
import Rota from "../models/Rota.js";
import Unidade from "../models/Unidade.js";
import Usuario from "../models/Usuario.js";
import Curso from "../models/Curso.js";
import Turma from "../models/Turma.js";
import Estudante from "../models/Estudante.js";
import Projeto from "../models/Projeto.js";
import Estagio from "../models/Estagio.js";
import Refeicao from "../models/Refeicao.js";
import RefeicaoTurma from "../models/RefeicaoTurma.js";
import Supplier from "../models/Supplier.js";

// Seu mapeador “globalFakeMapping” (se estiver usando)
import getGlobalFakeMapping from "./globalFakeMapping.js";

// Resolver globalFakeMapping antes de usar
const globalFakeMapping = await getGlobalFakeMapping();

// ----------------------------------------------------------------------------
// 1) Conectar ao banco de dados
// ----------------------------------------------------------------------------
await DbConect.conectar();

// ----------------------------------------------------------------------------
// 2) Funções auxiliares
// ----------------------------------------------------------------------------
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function getRandomImageFromFolder() {
  const directoryPath = "./src/seeds/rostos";
  const files = fs.readdirSync(directoryPath);
  const randomIndex = getRandomInt(files.length);

  console.log("Random file:", files[randomIndex]);
  return path.join(files[randomIndex]);
}

// Função para gerar senha criptografada
export function gerarSenhaHash() {
  return bcrypt.hashSync('ABab@123456', 12);
}

async function seedSuppliers() {
  // Limpa a coleção de suppliers
  await Supplier.deleteMany();

  const suppliers = [];
  for (let i = 0; i < 100; i++) {
    suppliers.push({
      nome: globalFakeMapping.nome(),
      email: globalFakeMapping.email(),
      ativo: globalFakeMapping.ativo(),
      cnpj: globalFakeMapping.cnpj(),
      telefone: globalFakeMapping.telefone(),
      endereco: {
        logradouro: globalFakeMapping.endereco().logradouro,
        numero: globalFakeMapping.endereco().numero,
        complemento: globalFakeMapping.endereco().complemento,
        bairro: globalFakeMapping.endereco().bairro,
        cidade: globalFakeMapping.endereco().cidade,
        estado: globalFakeMapping.endereco().estado,
        cep: globalFakeMapping.endereco().cep,
      }
    });
  }

  const result = await Supplier.collection.insertMany(suppliers);
  console.log(suppliers.length + " Suppliers inseridos!");

  return Supplier.find();
}


// ----------------------------------------------------------------------------
// 3) SEED de Unidades, Rotas, Grupos, Usuários
// ----------------------------------------------------------------------------
async function seedUnidades() {
  // Remove
  await Unidade.deleteMany();

  const unidades_array = ["Matriz", "Filial 1", "Filial 2", "Filial 3", "Filial 4", "Filial 5"];
  const unidades = [];

  // Cria todas as unidades listadas
  unidades_array.forEach((nome) => {
    unidades.push({
      nome,
      localidade: globalFakeMapping.localidade() + " - " + faker.address.state(),
      ativo: globalFakeMapping.ativo(),
    });
  });

  // (Opcional) Gera outra unidade “Matriz” se quiser duplicar
  unidades.push({
    nome: "Matriz",
    localidade: "São Paulo - SP",
    ativo: true,
  });

  const result = await Unidade.collection.insertMany(unidades);
  console.log(Object.keys(result.insertedIds).length + " Unidades inseridas!");

  // Retorna do banco para ter _id populado
  return Unidade.find();
}

async function seedRotas() {
  // Remove
  await Rota.deleteMany();

  const rotas_array = [
    "rotas",
    "rotas:id",
    "grupos",
    "grupos:id",
    "unidades",
    "unidades:id",
    "usuarios",
    "usuarios:id",
  ];

  const rotas = rotas_array.map((rota) => ({
    rota,
    dominio: "localhost",
    ativo: true,
    buscar: true,
    enviar: true,
    substituir: true,
    modificar: true,
    excluir: true,
  }));

  const result = await Rota.collection.insertMany(rotas);
  console.log(Object.keys(result.insertedIds).length + " Rotas inseridas!");

  return Rota.find();
}

async function seedGrupos(unidades, rotas) {
  // Remove
  await Grupo.deleteMany();

  const grupos_array = ["Gerente", "Supervisor", "Operador", "Vendedor", "Padrão"];
  const grupos = [];

  // Grupo fixo com acesso total
  const grupoAdministrador = {
    nome: "Administrador",
    descricao: "Grupo com acesso total a todas as unidades e rotas",
    ativo: true,
    unidades: unidades.map((u) => u._id),
    permissoes: rotas.map((r) => ({ ...r.toObject(), _id: r._id })),
  };
  grupos.push(grupoAdministrador);

  // Demais grupos, cada grupo recebe exatamente UMA unidade
  grupos_array.forEach((nome) => {
    const unidadeRandom = unidades[getRandomInt(unidades.length)];
    grupos.push({
      nome,
      descricao: globalFakeMapping.descricao(),
      ativo: true,
      unidades: [unidadeRandom._id],
      permissoes: rotas.map((r) => ({ ...r.toObject(), _id: r._id })),
    });
  });

  const result = await Grupo.collection.insertMany(grupos);
  console.log(Object.keys(result.insertedIds).length + " Grupos inseridos!");

  // Retorna grupos atualizados
  return Grupo.find();
}


async function seedUsuarios(unidades, rotas, grupos) {
  // Remove
  await Usuario.deleteMany();

  // Rotas completas
  const rotasCompletas = rotas.map((r) => ({ ...r.toObject(), _id: r._id }));

  // Usuários fixos
  const usuariosFixos = [
    {
      nome: "Dev Oliveira",
      email: "dev@gmail.com",
      senha: gerarSenhaHash(),
      ativo: true,
      link_foto: await getRandomImageFromFolder(),
      permissoes: rotasCompletas,
      // unidades: unidades.map((u) => u._id),
      grupos: grupos.map((g) => g._id),
      unidades: unidades.map((u) => u._id),
    },
    {
      nome: "APP Oliveira",
      email: "app@gmail.com",
      senha: gerarSenhaHash(),
      ativo: true,
      link_foto: await getRandomImageFromFolder(),
      permissoes: rotasCompletas,
      grupos: grupos.map((g) => g._id),
      unidades: unidades.map((u) => u._id),
    },
    {
      nome: "Dev2 Oliveira",
      email: "gilberto.silva@ifro.edu.br",
      senha: gerarSenhaHash(),
      ativo: true,
      link_foto: await getRandomImageFromFolder(),
      permissoes: rotasCompletas,
      grupos: grupos.map((g) => g._id),
      unidades: unidades.map((u) => u._id),
    },
  ];

  await Usuario.collection.insertMany(usuariosFixos);
  console.log(usuariosFixos.length + " Usuários fixos inseridos!");

  // Usuários aleatórios, cada um recebe exatamente uma unidade e um grupo
  const usuariosAleatorios = [];
  for (let i = 0; i < 200; i++) {
    const primeiroNome = globalFakeMapping.nome();
    const sobrenome = faker.person.lastName();
    const nomeCompleto = `${primeiroNome} ${sobrenome} ${faker.person.lastName()}`;
    const email = faker.internet.email(primeiroNome, sobrenome).toLowerCase();

    // seleciona uma unidade e um grupo aleatórios
    const unidadeRandom = unidades[getRandomInt(unidades.length)];
    const grupoRandom = grupos[getRandomInt(grupos.length)];

    usuariosAleatorios.push({
      nome: nomeCompleto,
      email,
      senha: gerarSenhaHash(),
      ativo: globalFakeMapping.ativo(),
      link_foto: await getRandomImageFromFolder(),
      permissoes: rotasCompletas,
      grupos: [grupoRandom._id],    // um só
      unidades: [unidadeRandom._id],  // uma só
    });
  }

  await Usuario.collection.insertMany(usuariosAleatorios);
  console.log(usuariosAleatorios.length + " Usuários aleatórios inseridos!");
}


// ----------------------------------------------------------------------------
// 4) SEED de Curso, Turma, Estudante, Projeto, Estágio
// ----------------------------------------------------------------------------
async function seedCursos() {
  await Curso.deleteMany();

  const infoMock = {
    nome: "Informática",
    contra_turnos: { segunda: false, terca: false, quarta: true, quinta: false, sexta: false, sabado: false, domingo: false },
    codigo: "0303",
  };
  const edifMock = {
    nome: "Edificações",
    contra_turnos: { segunda: false, terca: true, quarta: false, quinta: false, sexta: false, sabado: false, domingo: false },
    codigo: "0301",
  };
  const eletroMock = {
    nome: "Eletromecânica",
    contra_turnos: { segunda: true, terca: false, quarta: false, quinta: false, sexta: false, sabado: false, domingo: false },
    codigo: "0302",
  };
  const adsMock = {
    nome: "ADS",
    contra_turnos: { segunda: true, terca: false, quarta: false, quinta: false, sexta: false, sabado: false, domingo: false },
    codigo: "0314",
  };

  await Curso.create(infoMock);
  await Curso.create(edifMock);
  await Curso.create(eletroMock);
  await Curso.create(adsMock);

  console.log("Cursos adicionados com sucesso!");
}

async function seedTurmas() {
  await Turma.deleteMany();

  const turmaDescrioes = [
    "Informática 1A", "Informática 2A", "Informática 3A",
    "Informática 1B", "Informática 2B", "Informática 3B",
    "Edificações 1A", "Edificações 2A", "Edificações 3A",
    "Edificações 1B", "Edificações 2B", "Edificações 3B",
    "Eletromecânica 1A", "Eletromecânica 2A", "Eletromecânica 3A",
    "Eletromecânica 1B", "Eletromecânica 2B", "Eletromecânica 3B",
  ];
  const turmaCodigos = [
    "20241.1.0303.1M", "20241.2.0303.1M", "20241.3.0303.1M",
    "20241.1.0303.1D", "20241.2.0303.1D", "20241.3.0303.1D",
    "20241.1.0301.1M", "20241.2.0301.1M", "20241.3.0301.1M",
    "20241.1.0301.1D", "20241.2.0301.1D", "20241.3.0301.1D",
    "20241.1.0302.1M", "20241.2.0302.1M", "20241.3.0302.1M",
    "20241.1.0302.1D", "20241.2.0302.1D", "20241.3.0302.1D",
  ];

  const cursos = await Curso.find({});
  const info = cursos.find((c) => c.nome === "Informática");
  const edif = cursos.find((c) => c.nome === "Edificações");
  const eletro = cursos.find((c) => c.nome === "Eletromecânica");

  for (let i = 0; i < turmaDescrioes.length; i++) {
    const descricao = turmaDescrioes[i];
    let cursoId = null;
    if (descricao.includes("Informática")) cursoId = info?._id;
    else if (descricao.includes("Edificações")) cursoId = edif?._id;
    else cursoId = eletro?._id;

    await Turma.create({
      codigo_suap: turmaCodigos[i],
      descricao,
      curso: cursoId,
    });
  }
  console.log("Turmas adicionadas com sucesso!");
}

async function seedEstudantes() {
  await Estudante.deleteMany();

  const turmas = await Turma.find({}).populate('curso'); // Populate curso para obter cursos_id
  for (let i = 0; i < 500; i++) {
    const randomTurma = turmas[getRandomInt(turmas.length)];
    const matricula = faker.string.numeric(13);

    await Estudante.create({
      matricula,
      nome: faker.person.fullName(),
      turma_id: randomTurma?._id,
      cursos_id: randomTurma.curso?._id,
      ativo: true,
    });
  }
  console.log("500 Estudantes gerados com sucesso!");
}


async function seedProjetos() {
  await Projeto.deleteMany();

  // Fetch 50 students and some users (for professor_responsavel)
  const estudantes = await Estudante.find({}).limit(50);
  const usuarios = await Usuario.find({}).limit(10); // Assume some users are professors

  for (let i = 0; i < 10; i++) {
    const estudantesProjeto = estudantes.slice(i * 5, (i + 1) * 5);
    const professor = usuarios[getRandomInt(usuarios.length)]; // Random professor

    await Projeto.create({
      descricao: `Projeto ${faker.hacker.noun()}`, // Use descricao instead of nome
      data_inicio: faker.date.recent(),
      data_termino: faker.date.future(),
      estudantes: estudantesProjeto.map((e) => e._id),
      contra_turnos: { // Use contra_turnos instead of turnos
        segunda: faker.datatype.boolean(),
        terca: faker.datatype.boolean(),
        quarta: faker.datatype.boolean(),
        quinta: faker.datatype.boolean(),
        sexta: faker.datatype.boolean(),
        sabado: faker.datatype.boolean(),
        domingo: faker.datatype.boolean(),
      },
      professor_responsavel: professor._id, // Add professor_responsavel
      status: "Em andamento",
    });
  }
  console.log("Projetos adicionados com sucesso!");
}

async function seedEstagios() {
  await Estagio.deleteMany();

  // 5 estágios
  const estudantes = await Estudante.find({}).limit(5);
  for (let i = 0; i < 5; i++) {
    const estudante = estudantes[i];
    await Estagio.create({
      descricao: "Estágio na CGTI do IFRO campus Vilhena",
      data_inicio: faker.date.recent(),
      data_termino: faker.date.future(),
      estudante: estudante?._id,
      contra_turnos: { // Use contra_turnos instead of turnos
        segunda: faker.datatype.boolean(),
        terca: faker.datatype.boolean(),
        quarta: faker.datatype.boolean(),
        quinta: faker.datatype.boolean(),
        sexta: faker.datatype.boolean(),
        sabado: faker.datatype.boolean(),
        domingo: faker.datatype.boolean(),
      },
      status: "ativo", // Use valid enum value
    });
  }
  console.log("Estágios adicionados com sucesso!");
}

// ----------------------------------------------------------------------------
// 5) SEED de Refeicao e RefeicaoTurma (1000 cada)
// ----------------------------------------------------------------------------

async function seedRefeicoes() {
  // Remove tudo
  await Refeicao.deleteMany();

  // Buscar estudantes e usuários para referenciar
  const estudantes = await Estudante.find({});
  const usuarios = await Usuario.find({});

  // Possíveis tipos de refeição
  const tipos = ["Café da Manhã", "Almoço", "Jantar", "Lanche", "Ceia"];

  const listaRefeicoes = [];
  for (let i = 0; i < 1000; i++) {
    // Random estudante
    const estudanteRandom = estudantes[getRandomInt(estudantes.length)];
    // Random user
    const usuarioRandom = usuarios[getRandomInt(usuarios.length)];
    // Random tipo
    const tipoRefeicao = tipos[getRandomInt(tipos.length)];

    const doc = {
      estudante: estudanteRandom._id,
      data: faker.date.recent({ days: 30 }), // data aleatória nos últimos 30 dias
      tipoRefeicao,
      usuarioRegistrou: usuarioRandom._id,
    };
    listaRefeicoes.push(doc);
  }

  await Refeicao.collection.insertMany(listaRefeicoes);
  console.log(listaRefeicoes.length + " Refeicoes inseridas!");
}

async function seedRefeicoesTurma() {
  // Remove
  await RefeicaoTurma.deleteMany();

  // Buscar turmas
  const turmas = await Turma.find({});
  const listaRT = [];

  for (let i = 0; i < 1000; i++) {
    const turmaRandom = turmas[getRandomInt(turmas.length)];

    const doc = {
      turma: turmaRandom._id,
      data_liberado: faker.date.future(), // Exemplo: data futura
      descricao: faker.lorem.sentence(),
    };
    listaRT.push(doc);
  }

  await RefeicaoTurma.collection.insertMany(listaRT);
  console.log(listaRT.length + " RefeicoesTurma inseridas!");
}

// ----------------------------------------------------------------------------
// 6) Execução final (ordem de chamada)
// ----------------------------------------------------------------------------
async function main() {
  try {
    // 1) Entidades de acesso
    const unidades = await seedUnidades();
    const rotas = await seedRotas();
    const grupos = await seedGrupos(unidades, rotas);
    await seedUsuarios(unidades, rotas, grupos);

    // 2) Entidades “Meals”
    await seedCursos();
    await seedTurmas();
    await seedEstudantes();
    await seedProjetos();
    await seedEstagios();
    await seedSuppliers();

    // 3) Refeicoes e RefeicoesTurma
    await seedRefeicoes();
    await seedRefeicoesTurma();

    console.log(">>> SEED FINALIZADO COM SUCESSO! <<<");
  } catch (err) {
    console.error("Erro ao executar SEED:", err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Executa tudo
main();

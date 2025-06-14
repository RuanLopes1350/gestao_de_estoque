// /src/seeds/seedX/seedGenerators.js

import bcrypt from 'bcryptjs';
import faker from 'faker-br';
import fs from 'fs';
import path from 'path';

// Função para gerar senha criptografada
export function gerarSenhaHash() {
    return bcrypt.hashSync('ABab@123456', 12);
}

// Função para gerar número inteiro aleatório
export function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Função para retornar uma imagem aleatória da pasta 'rostos'
export function getRandomImageFromFolder() {
    const directoryPath = './src/seeds/rostos';
    const files = fs.readdirSync(directoryPath);
    const randomIndex = getRandomInt(files.length);
    return path.join(files[randomIndex]);
}

// FUNÇÕES DE CRIAÇÃO DE OBJETOS

// Criação de Unidade
export function criarUnidade({ nome, localidade, ativo = true }) {
    return { nome, localidade, ativo };
}

// Criação de Rota
export function criarRota({ rota, dominio = 'localhost', ativo = true, buscar = true, enviar = true, substituir = true, modificar = true, excluir = true }) {
    return { rota, dominio, ativo, buscar, enviar, substituir, modificar, excluir };
}

// Criação de Grupo
export function criarGrupo({ nome, descricao, ativo = true, unidades = [], permissoes = [] }) {
    return { nome, descricao, ativo, unidades, permissoes };
}

// Criação de Usuário
export function criarUsuario({ nome, email, senha, ativo = true, link_foto, permissoes = [], grupos = [], unidades = [] }) {
    return { nome, email, senha, ativo, link_foto, permissoes, grupos, unidades };
}

// Função auxiliar para gerar email fake
export function gerarEmailFake() {
    const provedores = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    const nome = faker.name.firstName();
    const nome_meio = faker.name.lastName();
    const sobrenome = faker.name.lastName();
    const email = `${nome}.${sobrenome}${getRandomInt(9999999999)}+fake@${provedores[getRandomInt(provedores.length)]}`;
    return email.toLowerCase();
}

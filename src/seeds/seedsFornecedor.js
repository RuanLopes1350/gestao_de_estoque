import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DbConnect from '../config/DbConnect';
import getGlobalFakeMapping from './globalFakeMapping.js';
import { Fornecedor } from '../models/Fornecedor.js';

await DbConnect.conectar();

async function seedFornecedor() {
    await Fornecedor.deleteMany();

    const fornecedores = [];

    fornecedores.push(
        {
            nome_fornecedor: getGlobalFakeMapping().fornecedor.nome_fornecedor(),
            cnpj: getGlobalFakeMapping().fornecedor.cnpj(),
            endereco: [
                {
                    telefone: getGlobalFakeMapping().fornecedor.telefone(),
                    email: getGlobalFakeMapping().fornecedor.email(),
                }
            ]
        }
    )
    const resultado = await Fornecedor.insertMany(fornecedores);
    console.log("Fornecedores inseridos com sucesso:", resultado);
    DbConnect.desconectar();
}
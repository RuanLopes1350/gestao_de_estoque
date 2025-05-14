import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Fornecedor from '../models/Fornecedor.js';
import getGlobalFakeMapping from './globalFakeMapping.js';

async function seedFornecedor() {
    try {
        await Fornecedor.deleteMany({});
        
        const fornecedores = [];
        const fakeMapping = getGlobalFakeMapping();
        
        // Cria 50 fornecedores fake
        for (let i = 0; i < 50; i++) {
            fornecedores.push({
                nome_fornecedor: fakeMapping.fornecedor.nome_fornecedor(),
                cnpj: fakeMapping.fornecedor.cnpj(),
                endereco: fakeMapping.fornecedor.endereco()
            });
        }
        
        const result = await Fornecedor.create(fornecedores);
        return result;
    } catch (error) {
        console.error('Erro em seedFornecedor:', error);
        throw error;
    }
}

export default seedFornecedor;
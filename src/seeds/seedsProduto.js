import 'dotenv/config'
import mongoose from 'mongoose'
import Produto from '../models/Produto.js'
import getGlobalFakeMapping from './globalFakeMapping.js'

async function seedProduto(fornecedores = []) {
    try {
        await Produto.deleteMany();

        const produtos = [];
        const fakeMapping = getGlobalFakeMapping();

        // Garantir que temos fornecedores para referenciar
        if (fornecedores.length === 0) {
            throw new Error("Não há fornecedores disponíveis para criar produtos relacionados");
        }

        // Cria produtos associados a fornecedores reais
        for (let i = 0; i < 500; i++) {
            // Seleciona um fornecedor aleatório
            const fornecedor = fornecedores[Math.floor(Math.random() * fornecedores.length)];
            
            // Extraímos o ID numeral do documento MongoDB
            // Para mongo, normalmente seria o _id direto, mas o schema exige um número
            const fornecedorId = fornecedor._id.toString().substring(0, 8);
            const idNumerico = parseInt(fornecedorId, 16) % 1000; // Converter para um número inteiro gerenciável
            
            produtos.push({
                nome_produto: fakeMapping.produto.nome_produto(),
                descricao: fakeMapping.produto.descricao(),
                preco: fakeMapping.produto.preco(),
                marca: fakeMapping.produto.marca(),
                custo: fakeMapping.produto.preco() * 0.7,
                categoria: fakeMapping.produto.categoria(),
                estoque: Math.floor(Math.random() * 100) + 10,
                estoque_min: 10, 
                data_ultima_entrada: new Date(),
                status: true,
                id_fornecedor: idNumerico, // ID numérico derivado do ObjectId
                codigo_produto: `${fornecedor.nome_fornecedor.substring(0,3).toUpperCase()}-${fakeMapping.produto.codigo_produto()}`
            });
        }

        const resultado = await Produto.insertMany(produtos);
        return resultado;
    } catch (error) {
        console.error('Erro em seedProduto:', error);
        throw error;
    }
}

export default seedProduto;
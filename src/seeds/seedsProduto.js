import 'dotenv/config'
import mongoose from 'mongoose'
import Produto from '../models/Produto.js'
import getGlobalFakeMapping from './globalFakeMapping.js'

async function seedProduto() {
    try {
        await Produto.deleteMany();

        const produtos = [];

        // Cria 5 produtos fake
        for (let i = 0; i < 50; i++) {
            const fakeMapping = getGlobalFakeMapping();
            produtos.push({
                nome_produto: fakeMapping.produto.nome_produto(),
                descricao: fakeMapping.produto.descricao(),
                preco: fakeMapping.produto.preco(),
                marca: "Marca " + (i + 1), // Adicionado campo marca que está no modelo
                custo: fakeMapping.produto.preco() * 0.7, // Custo estimado em 70% do preço
                categoria: fakeMapping.produto.categoria(),
                estoque: Math.floor(Math.random() * 100) + 10, // Estoque aleatório entre 10-110
                estoque_min: 10, // Estoque mínimo padrão
                data_ultima_entrada: new Date(),
                data_ultima_saida: null,
                status: true,
                id_fornecedor: i + 1, // ID sequencial
                codigo_produto: fakeMapping.produto.codigo_produto()
            });
        }

        const resultado = await Produto.insertMany(produtos);
        console.log(`${resultado.length} produtos inseridos com sucesso`);
        return resultado;
    } catch (error) {
        console.error('Erro em seedProduto:', error);
        throw error;
    }
}

export default seedProduto;
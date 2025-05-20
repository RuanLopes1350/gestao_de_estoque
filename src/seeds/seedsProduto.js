import 'dotenv/config'
import mongoose from 'mongoose'
import Produto from '../models/Produto.js'
import getGlobalFakeMapping from './globalFakeMapping.js'

async function seedProduto(fornecedores = []) {
    try {
        await Produto.deleteMany();

        const produtos = [];
        const fakeMapping = getGlobalFakeMapping();

        
        if (fornecedores.length === 0) {
            throw new Error("Não há fornecedores disponíveis para criar produtos relacionados");
        }

        // Cria produtos associados a fornecedores reais
        for (let i = 0; i < 500; i++) {
            const fornecedor = fornecedores[Math.floor(Math.random() * fornecedores.length)];
            
            
            const fornecedorId = fornecedor._id.toString().substring(0, 8);
            const idNumerico = parseInt(fornecedorId, 16) % 1000;
            
            // Gerar o preço primeiro para poder usá-lo na determinação da categoria
            const preco = fakeMapping.produto.preco();
            
            // Definir categoria baseada no preço
            let categoria;
            if (preco >= 1001.00) {
                categoria = 'A';
            } else if (preco >= 500.00) {
                categoria = 'B';
            } else {
                categoria = 'C';
            }
            
            produtos.push({
                nome_produto: fakeMapping.produto.nome_produto(),
                descricao: fakeMapping.produto.descricao(),
                preco: preco,
                marca: fakeMapping.produto.marca(),
                custo: preco * 0.7,
                categoria: categoria,
                estoque: Math.floor(Math.random() * 100) + 10,
                estoque_min: 10, 
                data_ultima_entrada: new Date(),
                status: true,
                id_fornecedor: idNumerico,
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
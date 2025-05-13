import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DbConnect from '../config/DbConnect.js';
import Movimentacao from '../models/Movimentacao.js';
import Usuario from '../models/Usuario.js';
import Produto from '../models/Produto.js';
import Fornecedor from '../models/Fornecedor.js';
import getGlobalFakeMapping from './globalFakeMapping.js';

async function seedMovimentacao() {
    try {
        await Movimentacao.deleteMany({});
        
        // Obtém IDs reais para referências
        const usuarios = await Usuario.find().limit(5);
        const produtos = await Produto.find().limit(5);
        const fornecedores = await Fornecedor.find().limit(5);
        
        if (usuarios.length === 0 || produtos.length === 0 || fornecedores.length === 0) {
            console.warn("Aviso: Não há dados suficientes para criar movimentações.");
            return [];
        }

        const movimentacoes = [];
        
        // Tipos de movimentação
        const tipos = ['entrada', 'saida'];
        
        for (let i = 0; i < 25; i++) {
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
            const produto = produtos[Math.floor(Math.random() * produtos.length)];
            const fornecedor = fornecedores[Math.floor(Math.random() * fornecedores.length)];
            
            // Quantidade aleatória entre 1 e 20
            const quantidade = Math.floor(Math.random() * 20) + 1;
            
            movimentacoes.push({
                tipo: tipo,
                destino: tipo === 'entrada' ? 'Estoque' : 'Venda',
                data_movimentacao: new Date(),
                id_usuario: usuario._id,
                nome_usuario: usuario.nome_usuario,
                produtos: [{
                    produto_ref: produto._id,
                    id_produto: Math.floor(Math.random() * 1000) + 1, // ID aleatório para simulação
                    codigo_produto: produto.codigo_produto,
                    nome_produto: produto.nome_produto,
                    quantidade_produtos: quantidade,
                    preco: produto.preco,
                    custo: produto.custo,
                    // Convertendo ObjectId para Number usando o contador i + 1 ou o id_fornecedor do produto
                    id_fornecedor: produto.id_fornecedor || (i + 1),
                    nome_fornecedor: fornecedor ? fornecedor.nome_fornecedor : 'Fornecedor Padrão'
                }]
            });
        }
        
        const resultado = await Movimentacao.insertMany(movimentacoes);
        console.log(`${resultado.length} movimentações inseridas com sucesso`);
        return resultado;
    } catch (error) {
        console.error('Erro em seedMovimentacao:', error);
        throw error;
    }
}

export default seedMovimentacao;
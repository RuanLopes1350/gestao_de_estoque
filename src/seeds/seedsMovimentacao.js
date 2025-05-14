import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Movimentacao from '../models/Movimentacao.js';
import getGlobalFakeMapping from './globalFakeMapping.js';

async function seedMovimentacao(usuarios = [], produtos = [], fornecedores = []) {
    try {
        await Movimentacao.deleteMany({});
        
        // Verificar se temos dados suficientes para criar relacionamentos
        if (usuarios.length === 0 || produtos.length === 0 || fornecedores.length === 0) {
            throw new Error("Dados insuficientes para criar movimentações relacionadas");
        }

        const movimentacoes = [];
        const tipos = ['entrada', 'saida'];
        
        // Criar 25 movimentações usando os documentos existentes
        for (let i = 0; i < 25; i++) {
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
            const produto = produtos[Math.floor(Math.random() * produtos.length)];
            
            // Encontrar o fornecedor que corresponde ao produto
            const fornecedorId = produto.id_fornecedor;
            let nomeFornecedor = 'Fornecedor Desconhecido';
            
            // Tentamos encontrar o fornecedor correspondente pelo ID numérico derivado
            for (const fornecedor of fornecedores) {
                const tempId = fornecedor._id.toString().substring(0, 8);
                const tempNumeric = parseInt(tempId, 16) % 1000;
                if (tempNumeric === fornecedorId) {
                    nomeFornecedor = fornecedor.nome_fornecedor;
                    break;
                }
            }
            
            const quantidade = Math.floor(Math.random() * 20) + 1;
            
            movimentacoes.push({
                tipo: tipo,
                destino: tipo === 'entrada' ? 'Estoque' : 'Venda',
                data_movimentacao: new Date(),
                id_usuario: usuario._id,
                nome_usuario: usuario.nome_usuario,
                produtos: [{
                    produto_ref: produto._id,
                    id_produto: produto.id_fornecedor * 100 + i, // ID derivado do fornecedor para manter relação
                    codigo_produto: produto.codigo_produto,
                    nome_produto: produto.nome_produto,
                    quantidade_produtos: quantidade,
                    preco: produto.preco,
                    custo: produto.custo,
                    id_fornecedor: produto.id_fornecedor, // Mantém a mesma referência do produto
                    nome_fornecedor: nomeFornecedor
                }]
            });
        }
        
        const resultado = await Movimentacao.insertMany(movimentacoes);
        return resultado;
    } catch (error) {
        console.error('Erro em seedMovimentacao:', error);
        throw error;
    }
}

export default seedMovimentacao;
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DbConnect from '../config/DbConnect';
import { Movimentacao } from '../models/Movimentacao';
import getGlobalFakeMapping from './globalFakeMapping';

await DbConnect.conectar();

async function seedMovimentacao() {

    await Movimentacao.deleteMany();

    const movimentacoes = [];

    movimentacoes.push(
        {
            tipo: getGlobalFakeMapping().movimentacao.tipo(),
            destino: getGlobalFakeMapping().movimentacao.destino(),
            data_movimentacao: getGlobalFakeMapping().movimentacao.data_movimentacao(),
            id_usuario: getGlobalFakeMapping().movimentacao.id_usuario(),
            nome_usuario: getGlobalFakeMapping().movimentacao.nome_usuario(),
            produtos: [
                {
                    produto_ref: getGlobalFakeMapping().movimentacao.produtos.produto_ref(),
                    id_produto: getGlobalFakeMapping().movimentacao.produtos.id_produto(),
                    codigo_produto: getGlobalFakeMapping().movimentacao.produtos.codigo_produto(),
                    nome_produto: getGlobalFakeMapping().movimentacao.produtos.nome_produto(),
                    quantidade_produtos: getGlobalFakeMapping().movimentacao.produtos.quantidade_produtos(),
                    preco: getGlobalFakeMapping().movimentacao.produtos.preco(),
                    custo: getGlobalFakeMapping().movimentacao.produtos.custo(),
                    id_fornecedor: getGlobalFakeMapping().movimentacao.produtos.id_fornecedor(),
                    nome_fornecedor: getGlobalFakeMapping().movimentacao.produtos.nome_fornecedor(),
                },
            ],
        }
    )
    const resultado = await Movimentacao.insertMany(movimentacoes);
    console.log("Movimentações inseridas com sucesso:", resultado);
    DbConnect.desconectar();
}

export default seedMovimentacao;
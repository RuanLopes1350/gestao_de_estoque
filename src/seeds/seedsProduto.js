import 'dotenv/config'
import mongoose, { get } from 'mongoose'
import DbConnect from '../config/DbConnect'
import { Produto } from '../models/Produto'
import getGlobalFakeMapping from './globalFakeMapping'

await DbConnect.conectar()

async function seedProduto() {

    await Produto.deleteMany();
    
    const produtos = [];

    produtos.push(
        {
            nome: getGlobalFakeMapping().produto.nome(),
            descricao: getGlobalFakeMapping().produto.descricao(),
            preco: getGlobalFakeMapping().produto.preco(),
            marca: getGlobalFakeMapping().produto.marca(),
            custo: getGlobalFakeMapping().produto.custo(),
            categoria: getGlobalFakeMapping().produto.categoria(),
            estoque: getGlobalFakeMapping().produto.estoque(),
            estoque_min: getGlobalFakeMapping().produto.estoque_min(),
            data_ultima_entrada: getGlobalFakeMapping().produto.data_ultima_entrada(),
            data_ultima_saida: getGlobalFakeMapping().produto.data_ultima_saida(),
            status: getGlobalFakeMapping().produto.status(),
            id_fornecedor: getGlobalFakeMapping().produto.id_fornecedor(),
            codigo_produto: getGlobalFakeMapping().produto.codigo_produto(),
        }
    )
    
    const resultado = await Produto.insertMany(produtos);
    console.log("Produtos inseridos com sucesso:", resultado);
    DbConnect.desconectar();
}
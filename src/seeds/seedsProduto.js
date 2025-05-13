import 'dotenv/config'
import mongoose from 'mongoose'
import Produto from '../models/Produto.js'
import getGlobalFakeMapping from './globalFakeMapping.js'

async function seedProduto(fornecedores = []) {
    try {
        await Produto.deleteMany();

        const produtos = [];
        const fakeMapping = getGlobalFakeMapping();

        // Busca fornecedores se não foram fornecidos
        if (fornecedores.length === 0) {
            const Fornecedor = mongoose.model('fornecedores');
            fornecedores = await Fornecedor.find();
            console.log(`Encontrados ${fornecedores.length} fornecedores no banco`);
        }

        if (fornecedores.length === 0) {
            console.warn("Aviso: Nenhum fornecedor encontrado. Produtos serão criados com IDs fictícios.");
        }

        // Cria produtos associados a fornecedores reais
        for (let i = 0; i < 50; i++) {
            // Seleciona um fornecedor aleatório
            const fornecedor = fornecedores.length > 0 
                ? fornecedores[Math.floor(Math.random() * fornecedores.length)] 
                : { _id: i+1, nome_fornecedor: `Fornecedor ${i+1}` };

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
                id_fornecedor: Number(fornecedor._id) || i+1,
                codigo_produto: fakeMapping.produto.codigo_produto()
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
import "dotenv/config";
import mongoose from "mongoose";

import DbConnect from "../config/DbConnect.js";

import seedUsuario from "./seedsUsuario.js";
import seedFornecedor from "./seedsFornecedor.js";
import seedProduto from "./seedsProduto.js";
import seedMovimentacao from "./seedsMovimentacao.js";

async function main() {
    try {
        await DbConnect.conectar();
        console.log("Conexão com o banco de dados estabelecida.");
        
        const usuarios = await seedUsuario();
        console.log("Seed de usuários concluído.");
        
        const fornecedores = await seedFornecedor();
        console.log("Seed de fornecedores concluído.");
        
        const produtos = await seedProduto();
        console.log("Seed de produtos concluído.");
        
        const movimentacoes = await seedMovimentacao();
        console.log("Seed de movimentações concluído.");
        
        console.log("Todos os dados inseridos com sucesso!");
    } catch (erro) {
        console.error("Erro ao inserir dados:", erro);
    } finally {
        await mongoose.connection.close();
        console.log("Conexão com o banco de dados fechada.");
        process.exit(0);
    }
}

// Execute a função principal
main();
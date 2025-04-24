import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

class Produto {
    constructor() {
        const produtoSchema = new mongoose.Schema(
            {
                nome: {type: String, index: true, required: true},
                descricao: {type: String},
                preco: {type: Number, required: true},
                marca: {type: String},
                custo: {type: Number, required: true},
                categoria: {type: String, required: true},
                // continuar o restante dos atributos do produto
            }
        )
    }
}
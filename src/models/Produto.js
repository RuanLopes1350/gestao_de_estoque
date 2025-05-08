import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';


class Produto {
    constructor() {
        const produtoSchema = new mongoose.Schema(
            {
                nome_produto: {type: String, index: true, required: true},
                descricao: {type: String},
                preco: {type: Number, required: true},
                marca: {type: String},
                custo: {type: Number, required: true},
                categoria: {type: String, required: true},
                estoque: {type: Number, required: true},
                estoque_min: {type: Number, required: true},
                data_ultima_entrada: {type: Date},
                data_ultima_saida: {type: Date},
                status: {type: Boolean, default: true},
                id_fornecedor: {type: Number, required: true},
                codigo_produto: {type: String, required: true, index: true},
            },
            {
                timestamps: {createdAt: 'data_cadastro', updatedAt: 'data_ultima_atualizacao'},
                versionKey: false,
            }
        )
        produtoSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('produto', produtoSchema);
    }
}

export default new Produto().model;
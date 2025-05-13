import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

class Fornecedor {
    constructor() {
        const fornecedorSchema = new mongoose.Schema(
            {
                nome_fornecedor: {type: String, required: true, index: true},
                cnpj: {type: String, required: true, index: true},
                endereco: [
                    {
                        telefone: {type: String, required: true},
                        email: {type: String, required: true},
                        
                    }
                ]
            },
            {
                timestamps: {createdAt: 'data_cadastro', updatedAt: 'data_ultima_atualizacao'},
                versionKey: false,
            }
        )
        fornecedorSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('fornecedores', fornecedorSchema);
    }
}

export default new Fornecedor().model;
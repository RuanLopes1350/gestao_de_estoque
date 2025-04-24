import moongoose from 'mongoose';
import moongoosePaginate from 'mongoose-paginate-v2';

export class Fornecedor {
    constructor() {
        const fornecedorSchema = new mongoose.Schema(
            {
                nome: {type: String, required: true, index: true},
                cnpj: {type: String, required: true, index: true},
                endereco: [
                    {
                        telefone: {type: String, required: true},
                        email: {type: String, required: true},
                        
                    }
                ]
            }
        )
    }
}
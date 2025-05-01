import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export class Usuario {
    constructor() {
        const usuarioSchema = mongoose.Schema (
            {
                nome: {type: String, index: true, required: true},
                matricula: {type: String, index: true, required: true},
                senha: {type: String, required: true},
                cargo: {type: String, required: true},
                data_cadastro: {type: Date, default: Date.now},
                data_ultima_atualizacao: {type: Date, default: Date.now},
            },
            {
                timestamps: {createdAt: 'data_cadastro', updatedAt: 'data_ultima_atualizacao'},
                versionKey: true,
            }
        )
    }
}
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export class Usuario {
    constructor() {
        const usuarioSchema = mongoose.Schema (
            {
                nome_usuario: {type: String, index: true, required: true},
                matricula: {type: String, index: true, required: true, unique: true},
                senha: {type: String, required: true, select: false},
                email: {type: String, required: true, unique: true},
                cargo: {type: String, required: true},
                status: {type: Boolean, default: true},
                acessToken: {type: String, required: true},
                refreshToken: {type: String, required: true},
                data_cadastro: {type: Date, default: Date.now},
                data_atualizacao: {type: Date, default: Date.now},
                data_ultimo_login: {type: Date, default: Date.now},
            },
            {
                versionKey: false,
                timestamps: {createdAt: 'data_cadastro', updatedAt: 'data_atualizacao'},
            }
        )
        usuarioSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('usuarios', usuarioSchema);
    }
}

export default new Usuario().model;
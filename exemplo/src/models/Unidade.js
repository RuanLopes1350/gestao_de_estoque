// src/models/Unidade.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

class Unidade {
    constructor() {
        const unidadeSchema = new mongoose.Schema(
            {
                nome: { type: String, index: true,  trim: true },
                localidade: { type: String,  trim: true },
                ativo: { type: Boolean, default: true }
            },
            {
                timestamps: true,
                versionKey: false
            }
        );

        // Índice composto para garantir a unicidade de 'nome' e 'localidade'
        unidadeSchema.index({ nome: 1, localidade: 1 }, { unique: true });

        // Plugin de paginação
        unidadeSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('unidades', unidadeSchema);
    }
}

export default new Unidade().model;

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export class Movimentacao {
    constructor() {
        const movimentacaoSchema = new mongoose.Schema(
            {
                tipo: { type: String, required: true, index: true },
                destino: { type: String, required: true, index: true },
                data_movimentacao: { type: Date, required: true, default: Date.now },
                id_usuario:
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'usuario',
                    required: true
                },
                produtos: [
                    {
                        produto_ref: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Produto',
                            required: true
                        },
                        id_produto: { type: Number, required: true },
                        codigo_produto: { type: String, required: true, index: true },
                        nome_produto: { type: String, required: true, index: true },
                        quantidade_produtos: { type: Number, required: true },
                        preco: { type: Number, required: true },
                        custo: { type: Number, required: true },
                        id_fornecedor: { type: Number, required: true },
                        nome_fornecedor: { type: String, required: true }
                    }
                ],
            },
            {
                timestamps: { createdAt: 'data_cadastro', updatedAt: 'data_ultima_atualizacao' },
                versionKey: true,
            }
        )
    }
}
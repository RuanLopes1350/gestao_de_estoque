import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Turma from "./Turma.js"; //Se não tiver o populate falha


class RefeicaoTurma {
    constructor() {
        const schema = new mongoose.Schema(
            {
                turma: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "turmas",
                    required: [true, "A turma é obrigatória!"]
                },
                data_inicial: { type: Date, required: [true, "Uma data é obrigatória!"] },
                data_final: { type: Date, required: [true, "Uma data é obrigatória!"] },
                contra_turnos: {
                    type: {
                      segunda: { type: Boolean,  default: false },
                      terca: { type: Boolean,  default: false },
                      quarta: { type: Boolean,  default: false },
                      quinta: { type: Boolean,  default: false },
                      sexta: { type: Boolean,  default: false },
                      sabado: { type: Boolean,  default: false },
                      domingo: { type: Boolean,  default: false },
                    }, required: [true, "Os contra-turnos são obrigatórios!"],
                    _id: false
                  },
            },
            { timestamps: true, versionKey: false }
        );

        schema.plugin(mongoosePaginate);
        this.model = mongoose.model("refeicoesTurmas", schema);
    }
}

export default new RefeicaoTurma().model;

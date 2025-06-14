import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Curso from "./Curso.js"; //Se não tiver o populate falha

class Turma {
    constructor() {
        const schema = new mongoose.Schema(
            {
                codigo_suap: { type: String, required: [true, "Um código do SUAP é obrigatório!"] },
                descricao: { type: String, required: [true, "Uma descrição é obrigatória!"] },
                curso: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "cursos",
                    required: [true, "Um id de curso é obrigatório!"]
                }
            },
            { timestamps: true, versionKey: false }
        );

        schema.plugin(mongoosePaginate);
        this.model = mongoose.model("turmas", schema);
    }
}

export default new Turma().model;

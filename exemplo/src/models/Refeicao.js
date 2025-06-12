// /src/models/Refeicao.js

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Estudante from "./Estudante.js"; //Se não tiver o populate falha
import Usuario from "./Usuario.js"; //Se não tiver o populate falha

class Refeicao {
  constructor() {
    const schema = new mongoose.Schema(
      {
        estudante: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "estudantes",
          required: true
        },
        data: { type: Date, required: true },
        tipoRefeicao: { type: String,  enum : ["contra-turno-curso", "ruma", "projeto", "estágio"] },
        usuarioRegistrou: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "usuarios",
          required: true
        }
      },
      { timestamps: true, versionKey: false }
    );

    schema.plugin(mongoosePaginate);
    this.model = mongoose.model("refeicoes", schema);
  }
}

export default new Refeicao().model;
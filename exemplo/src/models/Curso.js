// /src/models/Curso.js

import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

class Curso {
  constructor() {
    const cursoSchema = new mongoose.Schema(
      {
        codigo: { type: String, required: [true, "O codigo do curso é obrigatório!"] },
        nome: { type: String, ndex: true, required: [true, "O nome do curso é obrigatório!"] },
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
      {
        timestamps: true,
        versionKey: false
      }
    );
    cursoSchema.plugin(mongoosePaginate);
    this.model = mongoose.model('cursos', cursoSchema);
  }
}
export default new Curso().model;
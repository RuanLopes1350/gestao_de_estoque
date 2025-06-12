// /src/models/Example.js

import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

class Example {
  constructor() {
    const exampleSchema = new mongoose.Schema(
      {
        nome: { type: String, ndex: true, required: [true, "O nome do example é obrigatório!"] },
        descricao: { type: String, required: [true, "A descrição do example é obrigatória!"] },
        codigo: { type: String, required: [true, "O codigo do example é obrigatório!"] },
      },

      {
        timestamps: true,
        versionKey: false
      }
    );
    exampleSchema.plugin(mongoosePaginate);
    this.model = mongoose.model('examples', exampleSchema);
  }
}
export default new Example().model;
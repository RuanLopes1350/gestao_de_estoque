// models/Supplier.js
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';


class Supplier {
  constructor() {
    const supplierSchema = new mongoose.Schema(
      {
        nome: { type: String, index: true },
        email: { type: String, unique: true },
        ativo: { type: Boolean, default: false },
        cnpj: { type: String, unique: true },
        telefone: { type: String, unique: true },
        endereco: {
          logradouro: { type: String },
          numero: { type: String },
          complemento: { type: String },
          bairro: { type: String },
          cidade: { type: String },
          estado: { type: String },
          cep: { type: String }
        }
      },
      {
        timestamps: true,
        versionKey: false
      }
    );

    supplierSchema.plugin(mongoosePaginate);

    this.model = mongoose.model('suppliers', supplierSchema);
  }
}

export default new Supplier().model;

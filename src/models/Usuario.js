import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcrypt";

class Usuario {
  constructor() {
    const schema = new mongoose.Schema(
      {
        nome_usuario: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        matricula: { type: String, required: true, unique: true },
        senha: { type: String, required: true, select: false },
        perfil: {
          type: String,
          enum: ["administrador", "gerente", "estoquista"],
          default: "estoquista"
        },
        ativo: { type: Boolean, default: true },
        accesstoken: { type: String, select: false },
        refreshtoken: { type: String, select: false },
        token_recuperacao: { type: String, select: false },
        token_recuperacao_expira: { type: String, select: false },
        codigo_recuperacao: { type: String, select: false },
        data_expiracao_codigo: { type: Date, select: false }
      },
      {
        timestamps: {
          createdAt: "data_cadastro",
          updatedAt: "data_ultima_atualizacao",
        },
        versionKey: false,
      }
    );

    // Método para comparar senha
    schema.methods.verificarSenha = async function (senha) {
      return await bcrypt.compare(senha, this.senha);
    };

    schema.plugin(mongoosePaginate);
    this.model = mongoose.model("usuarios", schema);
  }
}

export default new Usuario().model;
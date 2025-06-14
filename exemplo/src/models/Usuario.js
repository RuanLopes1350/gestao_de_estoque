// models/Usuario.js
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

/**
 * Necessario manter os imports para Grupo e Unidade, mesmo sem uso aqui na classe pois o populate do mongoose não funciona se não houver a referencia
 */
import Grupo from './Grupo.js';
import Unidade from './Unidade.js';

class Usuario {
  constructor() {
    const usuarioSchema = new mongoose.Schema(
      {
        nome: { type: String, index: true },
        email: { type: String, unique: true},
        senha: { type: String, select: false },
        link_foto: { type: String },
        ativo: { type: Boolean, default: false },
        tokenUnico: { type: String, select: false }, // Token único para validação de email, recuperação de senha e autenticação
        refreshtoken: { type: String, select: false }, // Refresh token para geração de access token de autenticação longa duração 7 dias para invalidação
        accesstoken: { type: String, select: false }, // Refresh token para  autenticação curta longa 15 minutos para invalidação
        // Referências para Unidades
        codigo_recupera_senha: { type: String, select: false, unique: true }, // Código de recuperação de senha, usado para validar a recuperação de senha do usuário
        exp_codigo_recupera_senha: { type: Date, select: false }, // Data de expiração do código de recuperação de senha, usado para validar a recuperação de senha do usuário

        unidades: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'unidades' // nome da coleção dentro do banco
          }
        ],

        // Referências para Grupos
        grupos: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'grupos',
          }
        ],

        /**
         * Permissões personalizadas para cada rota, a rota e o domínio 
         * devem ser únicos e conrrespondentes a rota e domínio do sistema em /rotas
         */
        permissoes: [
          {
            rota: { type: String, index: true, required: true }, // usuários / grupos / unidades / rotas
            dominio: { type: String }, // http://localhost:3000
            ativo: { type: Boolean, default: false },  // false
            buscar: { type: Boolean, default: false },    // false
            enviar: { type: Boolean, default: false },   // false
            substituir: { type: Boolean, default: false },    // false
            modificar: { type: Boolean, default: false },  // false
            excluir: { type: Boolean, default: false }, // false
          }
        ],
      },
      {
        timestamps: true,
        versionKey: false
      }
    );

    // Validação personalizada para garantir que rota + dominio sejam únicos dentro do usuário isso tbm vai ser feito pelo ZOD
    usuarioSchema.pre('save', function (next) {
      const permissoes = this.permissoes;
      const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
      const setCombinacoes = new Set(combinacoes);

      if (combinacoes.length !== setCombinacoes.size) {
        return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada usuário.'));
      }

      next();
    });

    usuarioSchema.plugin(mongoosePaginate);

    this.model = mongoose.model('usuarios', usuarioSchema);
  }
}

export default new Usuario().model;

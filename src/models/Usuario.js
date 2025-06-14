import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
    nome_usuario: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    matricula: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    perfil: { type: String, enum: ['administrador', 'gerente', 'vendedor', 'estoquista'], default: 'estoquista' },
    ativo: { type: Boolean, default: true },
    accesstoken: String,
    refreshtoken: String,
    token_recuperacao: String,
    codigo_recuperacao: String,
    token_recuperacao_expira: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Middleware para hash de senha antes de salvar
usuarioSchema.pre('save', async function (next) {
    // Só faz hash da senha se ela foi modificada
    if (!this.isModified('senha')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para atualização da data de atualização
usuarioSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: Date.now() });
    next();
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
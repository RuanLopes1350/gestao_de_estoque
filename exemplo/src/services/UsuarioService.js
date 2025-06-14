// /src/services/UsuarioService.js

import UsuarioRepository from '../repositories/UsuarioRepository.js';
import { PermissoesArraySchema } from '../utils/validators/schemas/zod/PermissaoValidation.js';
import { CustomError, HttpStatusCodes, messages } from '../utils/helpers/index.js';
import { UsuarioQuerySchema, UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import TokenUtil from '../utils/TokenUtil.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import AuthHelper from '../utils/AuthHelper.js';

// Helper para __dirname em módulo ES
const getDirname = () => path.dirname(fileURLToPath(import.meta.url));

class UsuarioService {
  constructor() {
    this.repository = new UsuarioRepository();
    this.TokenUtil = TokenUtil; // Instância do TokenUtil para manipulação de tokens
  }

  /**
   * Lista usuários. Se um objeto de request é fornecido (com query, por exemplo),
   * retorna os usuários conforme os filtros.
   */
  async listar(req) {
    console.log('Estou no listar em UsuarioService');
    const data = await this.repository.listar(req);
    console.log('Estou retornando os dados em UsuarioService');
    return data;
  }

  /**
   * Cria um novo usuário após validação dos dados.
   */
  async criar(parsedData) {
    console.log('Estou no criar em UsuarioService');
    await this.validateEmail(parsedData.email);

    // gerar senha hash
    if (parsedData.senha) {
      const { senha: senhaValidada } = await AuthHelper.hashPassword(parsedData.senha);
      parsedData.senha = senhaValidada;
    }

    const data = await this.repository.criar(parsedData);
    return data;
  }

  /**
   * Atualiza um usuário existente.
   * Atenção: É proibido alterar o email. No serviço o objeto sempre chegará sem, pois o controller impedirá.
   */
  async atualizar(id, parsedData) {
    console.log('Estou no atualizar em UsuarioService');

    /**
     * Se o usuário não estiver ativo, remove os tokens de acesso e refresh.
     */
    if (!parsedData.ativo) {
      parsedData.accesstoken = null;
      parsedData.refreshtoken = null;
    }

    /**
     * Remove os campos que não podem ser atualizados.
     */
    delete parsedData.senha;
    delete parsedData.email;

    /**
     * Verifica se o usuário existe.
     */
    await this.ensureUserExists(id);

    /**
     * Valida as permissões.
     */
    if (parsedData.permissoes) {
      parsedData.permissoes = await this.validatePermissions(parsedData.permissoes);
    }

    const data = await this.repository.atualizar(id, parsedData);
    return data;
  }


  /**
   * Atualiza a senha de um usuário
   *
   * - Aceita **tokenRecuperacao** (JWT) ou **codigo_recupera_senha** (4 dígitos)
   * - Código expira após 60 min (verificado via `exp_codigo_recupera_senha`)
   */
  async atualizarSenha({ tokenRecuperacao = null, codigo_recupera_senha = null, senha }) {
    console.log('Estou no atualizarSenha em UsuarioService');


    console.log('Dados recebidos no service:', {
      tokenRecuperacao,
      codigo_recupera_senha,
      senha
    });


    /* 1) Nenhum identificador */
    if (!tokenRecuperacao && !codigo_recupera_senha) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'validationError',
        field: 'tokenRecuperacao / codigo_recupera_senha',
        details: [],
        customMessage:
          'Informe o token de recuperação ou o código de recuperação.',
      });
    }


    let usuarioId;

    /* ─── A) Código de 4 caracteres ───────────────────────────── */
    if (codigo_recupera_senha) {
      const usuario = await this.repository.buscarPorPorCodigoRecuperacao(
        codigo_recupera_senha,
      );

      if (!usuario) {
        throw new CustomError({
          statusCode: HttpStatusCodes.NOT_FOUND.code,
          errorType: 'validationError',
          field: 'codigo_recupera_senha',
          details: [
            {
              path: 'codigo_recupera_senha',
              message: 'Código de recuperação inválido ou não encontrado.',
            },
          ],
          customMessage: 'Código de recuperação inválido ou não encontrado.',
        });
      }

      /* Validação de expiração */
      const expTime = new Date(usuario.exp_codigo_recupera_senha).getTime();
      if (!expTime || expTime < Date.now()) {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'authenticationError',
          field: 'codigo_recupera_senha',
          details: [
            {
              path: 'codigo_recupera_senha',
              message: 'Código de recuperação expirado.',
            },
          ],
          customMessage: 'Código de recuperação expirado.',
        });
      }

      usuarioId = usuario._id.toString();
    }

    /* ─── B) Token JWT ────────────────────────────────────────── */
    if (tokenRecuperacao) {
      if (typeof tokenRecuperacao !== 'string' || !tokenRecuperacao.trim()) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: 'validationError',
          field: 'tokenRecuperacao',
          details: [
            {
              path: 'tokenRecuperacao',
              message: 'Token de recuperação inválido.',
            },
          ],
          customMessage: 'Token de recuperação deve ser uma string não vazia.',
        });
      }

      let decoded;
      try {
        decoded = await this.TokenUtil.decodePasswordRecoveryToken(
          tokenRecuperacao,
        );
      } catch (err) {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'authenticationError',
          field: 'tokenRecuperacao',
          details: [],
          customMessage: 'Token de recuperação expirado ou inválido.',
        });
      }

      if (!decoded.usuarioId) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: 'validationError',
          field: 'tokenRecuperacao',
          details: [],
          customMessage: 'Payload do token não contém ID do usuário.',
        });
      }

      usuarioId = decoded.usuarioId;
    }

    /* 3) Valida ID e busca usuário */
    UsuarioIdSchema.parse(usuarioId);

    const usuarioEncontrado = await this.repository.buscarPorId(usuarioId);
    if (!usuarioEncontrado) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: 'notFound',
        field: 'id',
        details: [],
        customMessage: 'Usuário não encontrado para alteração de senha.',
      });
    }

    /* 4) Valida / gera hash da nova senha */
    const { senha: senhaValidada } = UsuarioUpdateSchema.parse({ senha });
    const senhaHash = await bcrypt.hash(senhaValidada, 12);

    /* 5) Persiste */
    await this.repository.atualizarSenha(usuarioId, senhaHash);

    /* 6) Remove código após uso */
    if (codigo_recupera_senha) {
      await this.repository.atualizar(usuarioId, {
        codigo_recupera_senha: null,
        exp_codigo_recupera_senha: null,
      });
    }

    return { message: 'Senha atualizada com sucesso.' };
  }



  /**
   * Deleta um usuário existente.
   */
  async deletar(id) {
    console.log('Estou no deletar em UsuarioService');
    await this.ensureUserExists(id);
    const data = await this.repository.deletar(id);
    return data;
  }

  /**
   * Adiciona permissões a um usuário.
   */
  async adicionarPermissoes(req) {
    const parsedPermissoes = PermissoesArraySchema.parse(req.body.permissoes);
    const result = await this.repository.adicionarPermissoes(req.params.id, parsedPermissoes);
    return result;
  }

  /**
   * Remove uma permissão de um usuário.
   */
  async removerPermissao(usuarioId, permissaoId) {
    const result = await this.repository.removerPermissao(usuarioId, permissaoId);
    return result;
  }

  /**
   * Atualiza as permissões de um usuário.
   */
  async atualizarPermissoes(usuarioId, permissoesData) {
    const parsedData = PermissoesArraySchema.parse(permissoesData);
    const result = await this.repository.atualizarPermissoes(usuarioId, parsedData);
    return result;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // MÉTODOS AUXILIARES
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Valida a unicidade do email.
   */
  async validateEmail(email, id = null) {
    const usuarioExistente = await this.repository.buscarPorEmail(email, id);
    if (usuarioExistente) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'validationError',
        field: 'email',
        details: [{ path: 'email', message: 'Email já está em uso.' }],
        customMessage: 'Email já está em uso.',
      });
    }
  }

  /**
   * Valida o array de permissões.
   */
  async validatePermissions(permissoes) {
    if (!Array.isArray(permissoes)) {
      permissoes = [];
    }
    if (permissoes.length > 0) {
      PermissoesArraySchema.parse(permissoes);
    }

    /**
     * Verifica se as permissões existem no banco de dados.
     */
    const permissoesExistentes = await this.repository.buscarPorPermissao(permissoes);

    if (permissoesExistentes.length !== permissoes.length) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'validationError',
        field: 'permissoes',
        details: [{ path: 'permissoes', message: 'Permissões inválidas.' }],
        customMessage: 'Permissões inválidas.',
      });
    }

    return permissoesExistentes;
  }

  /**
   * Garante que o usuário existe.
   */
  async ensureUserExists(id) {
    const usuarioExistente = await this.repository.buscarPorId(id);
    // Se o usuário não existir, lança um erro pelo repositório
    return usuarioExistente;
  }

  /**
   * Valida extensão, tamanho, redimensiona e salva a imagem,
   * atualiza o usuário e retorna nome do arquivo + metadados.
   */
  async processarFoto(userId, file) {
    // 1) valida extensão
    const ext = path.extname(file.name).slice(1).toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'svg'];
    if (!validExts.includes(ext)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'validationError',
        field: 'file',
        details: [],
        customMessage: 'Extensão de arquivo inválida. Permitido: jpg, jpeg, png, svg.',
      });
    }

    // 2) valida tamanho (max 50MB)
    const MAX_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'validationError',
        field: 'file',
        details: [],
        customMessage: `Arquivo não pode exceder ${MAX_BYTES / (1024 * 1024)} MB.`,
      });
    }

    // 3) prepara paths
    const fileName = `${uuidv4()}.${ext}`;
    const uploadsDir = path.join(getDirname(), '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const uploadPath = path.join(uploadsDir, fileName);

    // 4) redimensiona/comprime
    const transformer = sharp(file.data)
      .resize(400, 400, { fit: sharp.fit.cover, position: sharp.strategy.entropy });
    if (['jpg', 'jpeg'].includes(ext)) {
      transformer.jpeg({ quality: 80 });
    }
    const buffer = await transformer.toBuffer();
    await fs.promises.writeFile(uploadPath, buffer);

    // 5) atualiza usuário no banco
    const dados = { link_foto: fileName };
    UsuarioUpdateSchema.parse(dados);
    await this.atualizar(userId, dados);

    // 6) retorna metadados adicionais
    return {
      fileName,
      metadata: {
        fileExtension: ext,
        fileSize: file.size,
        md5: file.md5, // vem do express-fileupload
      },
    };
  }
}

export default UsuarioService;

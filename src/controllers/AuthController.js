import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import AuthService from '../services/AuthService.js';
import { LoginSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';

class AuthController {
  constructor() {
    this.service = new AuthService();
  }

  login = async (req, res) => {
    console.log("Estou no login em AuthController")

    // 1º validação estrutural - validar os campos passados no body
    const body = req.body || {};
    const validatedBody = LoginSchema.parse(body);
    // se os dados validados, inicia processo de login
    const data = await this.service.login(validatedBody)
    return CommonResponse.success(res, data);
  }

  logout = async (req, res) => {
    console.log("Estou no logout em AuthController");

    // Extrai o cabeçalho Authorization
    const token = req.body.access_token || req.headers.authorization?.split(' ')[1];

    // Verifica se o token está presente e não é uma string inválida
    if (!token || token == 'null' || token === 'undefined') {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'invalidLogout',
        field: 'Logout',
        details: [],
        customMessage: 'Token de acesso é obrigatório para realizar logout'
      });
    }

    // Verifica e decodifica o access token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_ACCESS_TOKEN);

    // Verifica se o token decodificado contém o ID do usuário
    if (!decoded || decoded.id) {
      throw new CustomError({
        statusCode: HttpStatusCodes.INVALID_TOKEN.code,
        errorType: 'notAuthorized',
        field: 'NotAuthorized',
        details: [],
        customMessage: 'Token inválido ou malformado'
      });
    }

    // Encaminha o token para o serviço de logout
    const data = await this.service.logout(decoded.id, token);
    // Retorna uma resposta de sucesso
    return CommonResponse.success(res, null, messages.success.logout);
  }

  revoke = async (req, res) => {
    console.log("Estou no revoke em AuthController");

    const { id } = req.body;

    if (!id) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'validationError',
        field: 'id',
        details: [],
        customMessage: 'ID do usuário é obrigatório'
      })
    }

    const data = await this.service.revoke(id);
    return CommonResponse.success(res, data);
  }

  recuperarSenha = async (req, res) => {
    console.log("Estou no recuperarSenha em AuthController");

    const body = req.body || {};

    const validatedBody = UsuarioUpdateSchema.parse(body);
    const data = await this.service.recuperaSenha(req, validatedBody);
    return CommonResponse.success(res, data);
  }

  atualizarSenhaToken = async (req, res, next) => {
    console.log('Estou no atualizarSenhaToken em AuthController');

    const tokenRecuperacao = req.query.token || req.params.token || null; //token de recuperação passado na URL
    const senha = req.body.senha || null; //nova senha passada no body

    //verificar se veio token de recuperação
    if (!tokenRecuperacao) {
      throw new CustomError({
        statusCode: HttpStatusCodes.UNAUTHORIZED.code,
        errorType: 'unauthorized',
        field: 'authentication',
        details: [],
        customMessage: 'Token de recuperação na URL como parâmetro ou query é obrigatório para troca da senha.'
      });
    }

    //validar a senha com o schema
    const senhaSchema = UsuarioUpdateSchema.parse({ "senha": senha })

    // atualiza a senha
    await this.service.atualizarSenhaToken(tokenRecuperacao, senhaSchema);

    return CommonResponse.success(res, null, HttpStatusCodes.OK.code, 'Senha atualizada com sucesso.', { message: 'Senha atualizada com sucesso via token de recuperação.' });
  }

  atualizarSenhaCodigo = async (req, res, next) => {
    console.log("Estou no atualizarSenhaCodigo em AuthController");

    const codigo_recupera_senha = req.body.codigo_recupera_senha || null; //codigo de recuperaçao passado no body
    const senha = req.body.senha || null; //nova senha passada no body

    console.log('codigo_recupera_senha:', codigo_recupera_senha);
    console.log('senha:', senha);

    //verifica se veio código de recuperação
    if (!codigo_recupera_senha) {
      throw new CustomError({
        statusCode: HttpStatusCodes.UNAUTHORIZED.code,
        errorType: 'unauthorized',
        field: 'authentication',
        details: [],
        customMessage: 'Código de recuperação no body é obrigatório para troca da senha'
      });
    }

    //validar a senha com o schema
    const senhaSchema = UsuarioUpdateSchema.parse({ senha });

    //atualiza a senha
    await this.service.atualizarSenhaCodigo(codigo_recupera_senha, senhaSchema);

    return CommonResponse.success(res, null, HttpStatusCodes.OK.code, 'Senha atualizada com sucesso.', { message: 'Senha atualizada com sucesso via código de recuperação.' });
  }

  revoke = async (req, body) => {
    //Extrai o ID do usuario a ter o token revogado do body
    const id = req.body.id;
    //remove o token do banco de dados e retorna uma resposta de sucesso
    const data = await this.service.revoke(id);
    return CommonResponse.success(res);
  }

  refresh = async (req, res) => {
    //Extrai do body o token
    const token = req.body.refresh_token;

    //Verifica se o cabeçalho Authorization está presente
    if(!token || token === 'null' || token === 'undefined') {
      console.log('Cabeçalho Authorization ausente');
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_GATEWAY.code,
        errorType: 'invalidRefresh',
        field: 'Refresh',
        details: [],
        customMessage: 'Refresh token is missing.'
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_REFRESH_TOKEN);

    const data = await this.service.refresh(decoded.id, token);
    return CommonResponse.success(res, data);
  }
}
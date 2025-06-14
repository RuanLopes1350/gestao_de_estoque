// /src/controllers/TurmaController.js

import Estudante from "../models/Estudante.js";
import EstudanteService from "../services/EstudanteService.js";
import { paginateOptions } from "../config/paginacao.js";
import handleQuery from "../utils/handleQuery.js";
import Curso from "../models/Curso.js";

import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  errorHandler,
  messages,
  StatusService,
  asyncWrapper
} from '../utils/helpers/index.js';

import { EstudanteQuerySchema, EstudanteIdSchema } from '../utils/validators/schemas/zod/querys/EstudanteQuerySchema.js';
import { EstudanteSchema, EstudanteUpdateSchema } from '../utils/validators/schemas/zod/EstudanteSchema.js';

class EstudanteController {
  constructor() {
    this.service = new EstudanteService(); // Injeção de dependência
    //TODO: this.service = new UsuarioService();
  }

  async listar(req, res) {
    // Validação do ID (se existir)
    let { id } = req.params || {};
    if (id) {
      EstudanteIdSchema.parse(id);
    }
    // Validação das queries (se existirem)
    let query = req.query || {};
    if (Object.keys(query).length !== 0) {
      // deve apenas validar o objeto query, tendo erro o zod será responsável por lançar o erro
      await EstudanteQuerySchema.parseAsync(query);
    }

    //TODO: const data = await this.service.listar(req);
    const data = await this.service.listar(req);
    return CommonResponse.success(res, data);
  };

  async criar(req, res) {
    try {
      const estudante = req.body;
      estudante._id = estudante.matricula;

      // Verificar se a turma existe
      const turma = await Turma.findById(estudante.turma).catch((error) => {
        throw new Error(`Turma com id ${estudante.turma} não encontrada!`);
      });

      // Verificar se a matricula já existe
      const matriculaExiste = await Estudante.findOne({
        matricula: estudante.matricula,
      });
      if (matriculaExiste) {
        throw new Error("Matrícula já cadastrada!");
      }

      const novoEstudante = await Estudante.create(estudante)
        .then((estudante) => estudante.populate("turma"))
        .then((estudante) => estudante); //Fazer isso para retornar a turma populada;

      res.status(201).json({
        message: "Estudante adicionado com sucesso!",
        estudante: novoEstudante,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const estudante = req.body;
      const estudanteAtualizado = await Estudante.findByIdAndUpdate(
        id,
        estudante,
        { new: true }
      )
        .populate("turma")
        .then((estudante) => estudante); //Fazer isso para retornar a turma populada;

      if (!estudanteAtualizado) {
        throw new Error("Estudante não encontrado!");
      }

      res.status(200).json({
        message: "Estudante atualizado com sucesso!",
        estudante: estudanteAtualizado,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const existe = await Estudante.exists({ _id: id });
      if (!existe) {
        throw new Error("Estudante não encontrado!");
      }
      await Estudante.findByIdAndDelete(id);
      res.status(200).json({ message: "Estudante deletado com sucesso!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  async InativarEstudantes(req, res) {
    try {
      await Estudante.updateMany({}, { ativo: false });
      res
        .status(200)
        .json({ message: "Todos os estudantes foram inativados com sucesso!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  async Upload(req, res) {
    try {
      const { delimitador } = req.query;
      await EstudanteService.importEstudantesTeste(req.file.filename, delimitador);
      res.status(201).json({
        message: "Importação de estudantes feita com sucesso!",
      });
    } catch (error) {
      res.status(400).json({
        message:
          "Importação Interrompida! Verifique se todas turmas foram adicionadas anteriormente! Verifique se o delimitador do CSV está correto!",
        error_message: error.message,
      });
    }
  };
}

export default EstudanteController;

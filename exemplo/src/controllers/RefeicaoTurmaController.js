import RefeicaoTurma from "../models/RefeicaoTurma.js";
import Turma from "../models/Turma.js";
import { paginateOptions } from "../config//paginacao.js";
import handleQuery from "../utils/handleQuery.js";
import { addHours } from "date-fns";

class RefeicaoTurmaController {
  static ListarRefeicaoTurma = async (req, res) => {
    try {
      const query = handleQuery(req.query, { data_liberado: "desc" });
      const refeicoesTurma = await RefeicaoTurma.paginate(      
        {...query.filtros},
        {
          ...paginateOptions,
          populate: { path: "turma" },
          sort: query.ordenar,
          page: query.pagina,
          lean: true,
        }
      );
      res.status(200).json(refeicoesTurma);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  static ListarRefeicaoTurmaPorId = async (req, res) => {
    try {
      const { id } = req.params;
      const refeicaoTurma = await RefeicaoTurma.findById(id).populate("turma");
      if (!refeicaoTurma) {
        throw new error("Id de refeiçãoTurma não encontrada!");
      }
      res.status(200).json(refeicaoTurma);
    } catch (error) {
      if (
        error.message === "Id de refeiçãoTurma não encontrada!" ||
        error.kind === "ObjectId"
      ) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };

  static AdicionarRefeicaoTurma = async (req, res) => {
    try {
      const refeicaoTurma = req.body;

      // Verificar se a turma existe
      const turma = await Turma.findById(refeicaoTurma.turma).catch((error) => {
        throw new Error(`Turma com id ${refeicaoTurma.turma} não encontrada!`);
      });

      //Adicionar a data_liberado + 12 horas porque mexer com data é uma droga
      const novaRefeicaoTurma = await RefeicaoTurma.create({turma: refeicaoTurma.turma, data_liberado: addHours(new Date(refeicaoTurma.data_liberado), 12)})
        .then((refeicaoTurma) => refeicaoTurma.populate("turma"))
        .then((refeicaoTurma) => refeicaoTurma); //Fazer isso para retornar a turma populada;
      res.status(201).json({
        message: "Refeição por turma adicionada com sucesso!",
        refeicaoTurma: novaRefeicaoTurma,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  static AtualizarRefeicaoTurma = async (req, res) => {
    try {
      const { id } = req.params;
      const refeicaoTurma = req.body;
      const refeicaoTurmaAtualizado = await RefeicaoTurma.findByIdAndUpdate(
        id,
        refeicaoTurma,
        {
          new: true,
        }
      )
        .then((refeicaoTurma) => refeicaoTurma.populate("turma"))
        .then((refeicaoTurma) => refeicaoTurma); //Fazer isso para retornar a turma populada;
      if (!refeicaoTurmaAtualizado) {
        throw new Error("Id de refeiçãoTurma não encontrada!");
      }
      res.status(200).json({
        message: "Refeição por turma atualizada com sucesso!",
        refeicaoTurma: refeicaoTurmaAtualizado,
      });
    } catch (error) {
      if (
        error.message === "Id de refeiçãoTurma não encontrada!" ||
        error.kind === "ObjectId"
      ) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };

  static DeletarRefeicaoTurma = async (req, res) => {
    try {
      const { id } = req.params;
      const existe = await RefeicaoTurma.exists({ _id: id });
      if (!existe) {
        throw new Error("Id de refeiçãoTurma não encontrada!");
      }
      await RefeicaoTurma.findByIdAndDelete(id);
      res
        .status(200)
        .json({ message: "Refeição por turma deletada com sucesso!" });
    } catch (error) {
      if (
        error.message === "Id de refeiçãoTurma não encontrada!" ||
        error.kind === "ObjectId"
      ) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };
}

export default RefeicaoTurmaController;

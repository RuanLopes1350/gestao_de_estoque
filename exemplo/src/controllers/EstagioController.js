import Estagio from "../models/Estagio.js";
import Estudante from "../models/Estudante.js";
import { paginateOptions } from "../config/paginacao.js";
import { endOfDay, startOfDay } from "date-fns";
import handleQuery from "../utils/handleQuery.js";

class EstagioController {
  static ListarEstagios = async (req, res) => {
    try {
      const query = handleQuery(req.query, { data_inicio: "asc" });

      const estagios = await Estagio.paginate(
        {...query.filtros},
        {
          ...paginateOptions,
            sort: query.ordenar,
            populate: { path: "estudante" },
            page:query.pagina,
            lean: true,
        }
      );
      res.status(200).json(estagios);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  static ListarEstagioPorId = async (req, res) => {
    try {
      const { id } = req.params;
      const estagio = await Estagio.findById(id)
        .populate("estudante");
        if(!estagio){
          throw new Error("Estágio não encontrado!")
        }
      res.status(200).json(estagio);
    } catch (error) {
      if (error.message === "Estágio não encontrado!" || error.kind === "ObjectId") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };

  static AdicionarEstagio = async (req, res) => {
    try {
      const estagio = req.body;

      // Verificar se o estudante existe
      const estudante = await Estudante.findById(estagio.estudante);
      if (!estudante) {
        throw new Error(
          estagio.estudante === undefined
            ? "O estudante é obrigatório!"
            : `Estudante com matricula/id ${estagio.estudante} não encontrado!`
        );
      }
      const novoEstagio = await Estagio.create(estagio)
        .then((estagio) => estagio.populate("estudante"))
        .then((estagio) => estagio); //Fazer isso para retornar o estudante populado;
      res
        .status(201)
        .json({
          message: "Estágio adicionado com sucesso!",
          estagio: novoEstagio,
        });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  static AtualizarEstagio = async (req, res) => {
    try {
      const { id } = req.params;
      const estagio = req.body;
      const estagioAtualizado = await Estagio.findByIdAndUpdate(id, estagio, {
        new: true,
        runValidators: true,
      })
        .then((estagio) => estagio.populate("estudante"))
        .then((estagio) => estagio); //Fazer isso para retornar o estudante populado;
      if (!estagioAtualizado) {
        throw new Error("Estágio não encontrado!");
      }
      res.status(200).json({
        message: "Estágio atualizado com sucesso!",
        estagio: estagioAtualizado,
      });
    } catch (error) {
      if (error.message === "Estágio não encontrado!" || error.kind === "ObjectId") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };

  static DeletarEstagio = async (req, res) => {
    try {
      const { id } = req.params;
      const existe =  Estagio.exists({_id: id});
      if (!existe) {
        throw new Error("Estágio não encontrado!");
      }
      await Estagio.findByIdAndDelete(id);
      res.status(200).json({ message: "Estágio deletado com sucesso!" });
    } catch (error) {
      if (error.message === "Estágio não encontrado!" || error.kind === "ObjectId") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };
}

export default EstagioController;

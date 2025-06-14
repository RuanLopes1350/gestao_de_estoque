import Projeto from "../models/Projeto.js";
import Estudante from "../models/Estudante.js";
import { paginateOptions } from "../config/paginacao.js";
import handleQuery from "../utils/handleQuery.js";

class ProjetoController {
  static ListarProjetos = async (req, res) => {
    try {
      const query = handleQuery(req.query, { nome: "asc" });

      const projetos = await Projeto.paginate(
        { ...query.filtros },
        {
          ...paginateOptions,
          sort: query.ordenar,
          populate: { path: "estudantes" },
          page: query.pagina,
          lean: true,
        }
      );
      res.status(200).json(projetos);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  static ListarProjetoPorId = async (req, res) => {
    try {
      const { id } = req.params;
      const projeto = await Projeto.findById(id).populate("estudantes");
      if (!projeto) {
        throw new Error("Projeto não encontrado!");
      }
      res.status(200).json(projeto);
    } catch (error) {
      if (
        error.message === "Projeto não encontrado!" ||
        error.kind === "ObjectId"
      ) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };
  static AdicionarProjeto = async (req, res) => {
    try {
      const projeto = req.body;

      // Verificar se os estudantes existem
      for (let i = 0; i < projeto.estudantes.length; i++) {
        const estudante = await Estudante.findById(projeto.estudantes[i]);
        if (!estudante) {
          throw new Error(
            `Estudante com id ${projeto.estudantes[i]} não encontrado!`
          );
        }
      }
      const novoProjeto = await Projeto.create(projeto)
        .then((projeto) => projeto.populate("estudantes"))
        .then((projeto) => projeto); //Fazer isso para retornar os estudantes populada;
      res.status(201).json({
        message: "Projeto adicionado com sucesso!",
        projeto: novoProjeto,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  static AtualizarProjeto = async (req, res) => {
    try {
      const { id } = req.params;
      const projeto = req.body;
      const projetoAtualizado = await Projeto.findByIdAndUpdate(id, projeto, {
        new: true,
      })
        .then((projeto) => projeto.populate("estudantes"))
        .then((projeto) => projeto); //Fazer isso para retornar os estudantes populada;
      if (!projetoAtualizado) {
        throw new Error("Projeto não encontrado!");
      }
      res.status(200).json({
        message: "Projeto atualizado com sucesso!",
        projeto: projetoAtualizado,
      });
    } catch (error) {
      if (
        error.message === "Projeto não encontrado!" ||
        error.kind === "ObjectId"
      ) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };
  static DeletarProjeto = async (req, res) => {
    try {
      const { id } = req.params;
      const existe = await Projeto.exists({ _id: id });
      if (!existe) {
        throw new Error("Projeto não encontrado!");
      }
      await Projeto.findByIdAndDelete(id);
      res.status(200).json({
        message: "Projeto deletado com sucesso!",
      });
    } catch (error) {
      if (
        error.message === "Projeto não encontrado!" ||
        error.kind === "ObjectId"
      ) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };
}

export default ProjetoController;

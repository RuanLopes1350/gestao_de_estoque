import { isValid } from "date-fns";
import RefeicaoService from "../services/RefeicaoService.js";

class RefeicaoController{
  static Registrar = async (req, res) => {
    try {
      const { matricula } = req.body;
      const usuario = req.usuario;

      await RefeicaoService.registrar(matricula, usuario);

      const totalHoje = await RefeicaoService.totalHoje();

      res.status(201).json({error: false, message: "Refeição adicionada com sucesso!", totalHoje: totalHoje });
    } catch (error) {
      res.status(400).json({ error: true, message: error.message });
    }
  }

  static Relatorio = async (req, res) => {
    try {
      const { dataInicio, dataTermino, ...filtros } = req.query;
      /*
        Vai ter filtros de curso, turma, email(do usuario que registrou), tipoRefeicao
      */
      if(!dataInicio || !dataTermino){
        throw new Error("Data de início e data de término são obrigatórias");
      }
      
      if(!isValid(new Date(dataInicio)) || !isValid(new Date(dataTermino))){
        throw new Error("Datas inválidas!");
      }

      const relatorio = await RefeicaoService.relatorio(new Date(dataInicio), new Date(dataTermino), filtros);

      res.status(200).json(relatorio);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default RefeicaoController;
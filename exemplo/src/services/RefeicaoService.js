import Refeicao from "../models/Refeicao.js";
import Estudante from "../models/Estudante.js";
import RefeicaoTurma from "../models/RefeicaoTurma.js";
import Projetos from "../models/Projeto.js";
import Estagio from "../models/Estagio.js";
import { endOfDay, startOfDay, format } from "date-fns";

class RefeicaoService {
  static registrar = async (matricula, usuario) => {
    const dataAtual = new Date();
    const semana = [
      "domingo",
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
    ];
    const diaSemana = dataAtual.getDay(); // Domingo - Sabado : 0 - 6

    const estudante = await Estudante.findById(matricula).populate({
      path: "turma",
      populate: { path: "curso" },
    });

    if (!estudante) {
      throw new Error("Estudante não encontrado");
    }

    if(!estudante.ativo){
      throw new Error("Estudante não está ativo!");
    }

    let tipoRefeicao;
    let podeComer;

    if (estudante.turma.curso.contra_turnos[semana[diaSemana]]) {
      tipoRefeicao = "Contra turno";
      podeComer = estudante.turma.curso.contra_turnos[semana[diaSemana]];
    }

    if (!podeComer) {
      //Se ele não pode comer pelo turno do curso dele,procura o turno do projeto
      const projeto = await Projetos.find({ estudantes: matricula });
      for (let i = 0; i < projeto.length; i++) {
        //Caso tenha mais de um projeto
        if (
          projeto[i].data_inicio <= dataAtual &&
          projeto[i].data_termino >= dataAtual
        ) {
          if (projeto[i].turnos[semana[diaSemana]]) {
            podeComer = true;
            tipoRefeicao = "Projeto";
            break;
          }
        }
      }
    }
    if (!podeComer) {
      const estagio = await Estagio.find({ estudante: matricula });
      for (let i = 0; i < estagio.length; i++) {
        if (
          estagio[i].data_inicio <= dataAtual &&
          estagio[i].data_termino >= dataAtual
        ) {
          if (estagio[i].turnos[semana[diaSemana]]) {
            podeComer = true;
            tipoRefeicao = "Estágio";
            break;
          }
        }
      }
    }
    if (!podeComer) {
      const refeicaoTurma = await RefeicaoTurma.find({
        turma: estudante.turma._id,
      });

      for (let i = 0; i < refeicaoTurma.length; i++) {
        if (
          format(refeicaoTurma[i].data_liberado, "yyyy/MM/dd") ==
          format(dataAtual, "yyyy/MM/dd")
        ) {
          podeComer = true;
          tipoRefeicao = "Turma";
          break;
        }
      }
    }

    //Não tem refeição se já tiver uma refeição registrada no dia de hoje
    if (podeComer) {
      const refeicao = await Refeicao.findOne({
        "estudante.matricula": matricula,
        data: {
          $gte: startOfDay(dataAtual),
          $lt: endOfDay(dataAtual),
        },
      });
      if (refeicao) {
        throw new Error("O estudante já teve refeição hoje!");
      }
    }

    if (!podeComer) {
      throw new Error("O estudante não pode ter refeição hoje!");
    }

    await Refeicao.create({
      estudante: {
        nome: estudante.nome,
        matricula: estudante.matricula,
        curso: estudante.turma.curso.nome,
        turma: estudante.turma.descricao,
      },
      tipoRefeicao: tipoRefeicao,
      data: dataAtual,
      usuarioRegistrou: usuario,
    });
  };

  static relatorio = async (dataInicio, dataTermino, filtros) => {

    const mongooseFilters = {};

    for(const [key, value] of Object.entries(filtros)) {
      if(key == "email") {
        mongooseFilters["usuarioRegistrou.email"] = { $regex: new RegExp(value, "i") };
        continue;
      }

      if(key == "turma") {
        mongooseFilters["estudante.turma"] = { $regex: new RegExp(value, "i") };
        continue;
      }

      if(key == "curso") {
        mongooseFilters["estudante.curso"] = { $regex: new RegExp(value, "i") };
        continue;
      }

      //O resto é tratado como filtro(acho que é apenas o tipoRefeicao);
      if(value) {
        mongooseFilters[key] = { $regex: new RegExp(value, "i") };
      }
    }

    const total = async () => {
      const total = await Refeicao.where({
        data: {
          $gte: startOfDay(dataInicio),
          $lt: endOfDay(dataTermino),
        },
        ...mongooseFilters
      }).countDocuments();
      return { totalRefeicoes: total };
    };

    const contraTurno = async () => {
      const contraTurno = await Refeicao.where({
        data: {
          $gte: startOfDay(dataInicio),
          $lt: endOfDay(dataTermino),
        },
        tipoRefeicao: "Contra turno",
      }).countDocuments();
      return { contraTurno: contraTurno };
    };

    const projeto = async () => {
      const projeto = await Refeicao.where({
        data: {
          $gte: startOfDay(dataInicio),
          $lt: endOfDay(dataTermino),
        },
        tipoRefeicao: "Projeto",
      }).countDocuments();
      return { projeto: projeto };
    };

    const estagio = async () => {
      const estagio = await Refeicao.where({
        data: {
          $gte: startOfDay(dataInicio),
          $lt: endOfDay(dataTermino),
        },
        tipoRefeicao: "Estágio",
      }).countDocuments();
      return { estagio: estagio };
    };

    const turma = async () => {
      const turma = await Refeicao.where({
        data: {
          $gte: startOfDay(dataInicio),
          $lt: endOfDay(dataTermino),
        },
        tipoRefeicao: "Turma",
      }).countDocuments();
      return { turma: turma };
    };

    const refeicoesFind = async () => {
      const refeicoes = await Refeicao.find({
        data: {
          $gte: startOfDay(dataInicio),
          $lt: endOfDay(dataTermino),
        },
        ...mongooseFilters
      });
      return { refeicoes: refeicoes };
    };

    // Utilizando Promise.all para executar as consultas de forma paralela
    const relatorio = await Promise.all([
      total(),
      contraTurno(),
      projeto(),
      estagio(),
      turma(),
      refeicoesFind(),
    ])
      .then((values) => {
        const { refeicoes, ...quantidade } = Object.assign({}, ...values);
        return Object.assign(
          { dataInicio: dataInicio, dataTermino: dataTermino },
          { quantidade: quantidade },
          { refeicoes: refeicoes }
        );
      })
      .catch((error) => {
        throw error;
      });
    return relatorio;
  };

  static totalHoje = async () => {
    const total = await Refeicao.where({
      data: {
        $gte: startOfDay(new Date()),
        $lt: endOfDay(new Date()),
      },
    }).countDocuments();

    return total;
  };
}

export default RefeicaoService;

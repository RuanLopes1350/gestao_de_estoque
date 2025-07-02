import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Estudante from "../models/Estudante.js";
import Turma from "../models/Turma.js";
import Curso from "../models/Curso.js";
import CsvToJson from "convert-csv-to-json";
import EstudanteRepository from "../repositories/EstudanteRepository.js";

class EstudanteService {

  constructor() {
    this.repository = new EstudanteRepository();
  }

  /**
   * Lista usuários. Se um objeto de request é fornecido (com query, por exemplo),
   * retorna os usuários conforme os filtros.
   */
  async listar(req) {
    console.log('Estou no listar em EstudanteService');
    const data = await this.repository.listar(req);
    console.log('Estou retornando os dados em EstudanteService');
    return data;
  }

  //! usar esse cabecalho "id;turma;aluno;matricula;situacao", o delimitador pode mudar
  static async importEstudantesTeste(filename, delimiter = ",") {
    // Pegar o local do arquivo csv
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const csvPath = path.join(__dirname, "..", "..", "uploads", `${filename}`);

    const estudantesJson =
      CsvToJson.fieldDelimiter(delimiter).getJsonFromCsv(csvPath);

    // fazer dessa forma diminui o tempo de resposta
    const estudantesArr = []; // Array de estudantes para fazer o BulkSave no final e não ter que salvar a cada iteração de estudante
    const turmasExistentesArr = []; //Array de turmas existentes para evitar ter que fazer a query de encontrar turma a cada estudante

    try {
      for (let i = 0; i < estudantesJson.length; i++) {
        const estudante = estudantesJson[i];

        await this.#handleEstudante(estudante, estudantesArr, turmasExistentesArr);
      }

      Estudante.bulkSave(estudantesArr, { timestamps: false, session: null, w: 1, wtimeout: null, j: true });

      //Apagar o arquivo csv
      fs.unlinkSync(csvPath);
    } catch (error) {
      //Apagar o arquivo csv
      fs.unlinkSync(csvPath);

      throw error;
    }
  }

  // eu acho que talvez eu tenha complicado usando métodos privado aqui, mas faz lógica na minha cabeça

  static async #handleEstudante(estudante, estudArr, turmaExistArr) {

    let turmaDoc = turmaExistArr.find((turma) => turma.codigo_suap == estudante.turma);

    if (!turmaDoc) {
      turmaDoc = await Turma.findOne({
        codigo_suap: { $regex: `${estudante.turma}` },
      });
      if (turmaDoc) turmaExistArr.push(turmaDoc);
    }

    if (!turmaDoc) {
      turmaDoc = await this.#createTurmaOfCode(estudante.turma);
      turmaExistArr.push(turmaDoc);
    }

    let estudanteDoc = await Estudante.findOne({
      matricula: { $regex: `${estudante.matricula}` },
    });

    if (!estudanteDoc) {

      const newEstudante = Estudante({
        _id: estudante.matricula,
        nome: estudante.aluno,
        matricula: estudante.matricula,
        turma: turmaDoc._id,
        ativo: true,
      })
      estudArr.push(newEstudante);
    } else {
      estudanteDoc.ativo = true;
      estudanteDoc.turma = turmaDoc._id;
      estudArr.push(estudanteDoc);
    }
  }

  static async #createTurmaOfCode(codigoTurma) {
    const [ano, serie, codigoCurso, periodo] = codigoTurma.split(".");

    const cursoDoc = await Curso.findOne({
      codigo: { $regex: `${codigoCurso}` },
    });

    if (!cursoDoc) {
      throw new Error(
        `Código ${codigoCurso} de curso não encontrado! Certifique se de que existe um curso com esse cógigo.`
      );
    }

    const newTurma = {
      codigo_suap: codigoTurma,
      curso: cursoDoc._id,
      descricao: `Turma de ${ano} - Curso de ${cursoDoc.nome} - ${serie} série - ${periodo} `,
    };

    const turmaCriada = await Turma.create(newTurma)
      .then((turma) => turma.populate("curso"))
      .then((turma) => turma); //Fazer isso para retornar a turma populada;

    return turmaCriada;
  }


}

export default EstudanteService;

import e from"express";
import RefeicaoTurmaController from "../controllers/RefeicaoTurmaController.js";

const router =  e.Router();

router
  .get("/refeicoes-turmas",  RefeicaoTurmaController.ListarRefeicaoTurma)
  .post("/refeicoes-turmas",  RefeicaoTurmaController.AdicionarRefeicaoTurma)
  .get("/refeicoes-turmas/:id",  RefeicaoTurmaController.ListarRefeicaoTurmaPorId)
  .put("/refeicoes-turmas/:id",  RefeicaoTurmaController.AtualizarRefeicaoTurma)
  .delete("/refeicoes-turmas/:id",  RefeicaoTurmaController.DeletarRefeicaoTurma);

export default router;

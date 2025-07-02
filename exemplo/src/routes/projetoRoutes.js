import e from "express";
import ProjetoController from "../controllers/ProjetoController.js";

const router = e.Router();

router
  .get("/projetos",  ProjetoController.ListarProjetos)
  .post("/projetos",  ProjetoController.AdicionarProjeto)
  .get("/projetos/:id",  ProjetoController.ListarProjetoPorId)
  .put("/projetos/:id",  ProjetoController.AtualizarProjeto)
  .delete("/projetos/:id",  ProjetoController.DeletarProjeto);

export default router;

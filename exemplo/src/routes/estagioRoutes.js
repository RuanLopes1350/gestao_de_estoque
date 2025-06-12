import e from "express";
import EstagioController from "../controllers/EstagioController.js";

const router = e.Router();

router
  .get("/estagios",  EstagioController.ListarEstagios)
  .post("/estagios",  EstagioController.AdicionarEstagio)
  .get("/estagios/:id",  EstagioController.ListarEstagioPorId)
  .put("/estagios/:id",  EstagioController.AtualizarEstagio)
  .delete("/estagios/:id",  EstagioController.DeletarEstagio);

export default router;

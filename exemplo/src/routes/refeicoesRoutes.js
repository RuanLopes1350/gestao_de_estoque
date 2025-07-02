import e from "express";
import RefeicaoController from "../controllers/RefeicaoController.js";

const router = e.Router();

router
  .post("/refeicoes", RefeicaoController.Registrar)
  .get("/refeicoes", RefeicaoController.Relatorio);

export default router;

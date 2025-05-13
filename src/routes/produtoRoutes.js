import express from 'express';

import ProdutoController from '../controllers/ProdutoController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const produtoController = new ProdutoController();


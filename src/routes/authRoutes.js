import express from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.post('/login', (req, res) => AuthController.login(req, res));
router.post('/refresh', (req, res) => AuthController.refresh(req, res));

// Rotas protegidas
router.post('/logout', authMiddleware, (req, res) => AuthController.logout(req, res));
router.post('/revoke', authMiddleware, (req, res) => AuthController.revoke(req, res));

export default router;
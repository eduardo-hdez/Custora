import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import {authLimiter} from '../middleware/ratelimit.middleware.js';

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authLimiter, authController.postLogin);
router.post('/logout', authController.postLogout);

export default router;

import {rateLimit} from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5, // max 5 peticiones
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('login', {
      title: 'login',
      error: 'Haz superado el limite de intentos. Intentalo más tarde.',
      correo: req.body.correo,
    });
  },
});

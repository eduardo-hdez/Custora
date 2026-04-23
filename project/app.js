import 'dotenv/config';
import compression from 'compression';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/auth.routes.js';
import clienteRoutes from './src/routes/cliente.routes.js';
import empleadoRoutes from './src/routes/empleado.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({ extended: true }));

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * 15, // 15 minutos de inactividad
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  },
}));

// Hacer que la variable este disponible en todas las vistas
app.use((req, res, next) => {
  res.locals.concesionarias = req.session.concesionarias ?? [];
  res.locals.idConcesionaria = req.session.idConcesionaria ?? null;
  next();
});

app.use(authRoutes);
app.use('/cliente', clienteRoutes);
app.use('/empleado', empleadoRoutes);

// Páginas legales
app.get('/avisoprivacidad', (request, response) => {
  response.render('avisoprivacidad', { title: 'Aviso de Privacidad' });
});

app.get('/terminoscondiciones', (request, response) => {
  response.render('terminoscondiciones', { title: 'Términos y Condiciones' });
});

app.get('/', (request, response) => {
  response.redirect('/login');
});

export default app;

import 'dotenv/config';
import compression from 'compression';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/auth.routes.js';
import clienteRoutes from './src/routes/cliente.routes.js';
import empleadoRoutes from './src/routes/empleado.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PgSession = connectPgSimple(session);

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

const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: isProduction,
  store: new PgSession({
    pool: pgPool,
    schemaName: 'public',
    tableName: 'session',
  }),
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

app.use((error, request, response, next) => {
  console.error('[express-error]', {
    path: request.path,
    method: request.method,
    message: error?.message,
    code: error?.code,
    name: error?.name,
  });
  if (response.headersSent) {
    return next(error);
  }
  return response.status(500).send('Internal Server Error');
});

export default app;

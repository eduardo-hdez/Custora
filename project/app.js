import 'dotenv/config';
import compression from 'compression';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { csrfSync } from 'csrf-sync';
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
      scriptSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "'sha256-T9U76Q64V8htdr9TY5R6AS4UStIKoMU68kezfHSWxNI='",
        "'sha256-aB5iLhMAjZCWez56HD1OHbGyHnDFgCCx7kojYB0kY2k='" ,
        "'sha256-d0w2hHNrrTEZeMac//3+fgNIIKZBK3MU1r81Y1rdDkA='"
      ],
    },
  },
}));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
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

// Configuración de CSRF
const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req) => {
    if (req.body && req.body['_csrf']) return req.body['_csrf'];
    if (req.query && req.query['_csrf']) return req.query['_csrf'];
    if (req.headers['x-csrf-token']) return req.headers['x-csrf-token'];
    return null;
  },
});

app.use(csrfSynchronisedProtection);

// Prevención de caché en HTML para Vercel e inyección de variables
app.use((req, res, next) => {
  // Evitar que Vercel guarde en caché páginas con el token CSRF de una sesión específica
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.locals.csrfToken = generateToken(req);
  res.locals.concesionarias = req.session.concesionarias ?? [];
  res.locals.idConcesionaria = req.session.idConcesionaria ?? null;
  next();
});

// Manejo de errores CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    const referer = req.get('Referrer') || '/login';
    // Limpiamos params anteriores para no anidar invalidToken=1&invalidToken=1
    const cleanReferer = referer.split('?')[0]; 
    const qs = referer.includes('?') ? referer.split('?')[1] : '';
    const newQs = new URLSearchParams(qs);
    newQs.set('invalidToken', '1');
    return res.redirect(`${cleanReferer}?${newQs.toString()}`);
  }
  next(err);
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

import express from 'express';
import path from 'path';
import session from 'express-session';
import {fileURLToPath} from 'url';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import clienteRoutes from './src/routes/cliente.routes.js';
import empleadoRoutes from './src/routes/empleado.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({extended: true}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {httpOnly: true, maxAge: 1000 * 60 * 30} // 30 minutos
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

app.get('/', (request, response) => {
  response.redirect('/login');
});

app.listen(3000);

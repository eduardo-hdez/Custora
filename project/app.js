import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import clienteRoutes from './src/routes/cliente.routes.js';
import empleadoRoutes from './src/routes/empleado.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({ extended: true }));

app.use('/cliente', clienteRoutes);
app.use('/empleado', empleadoRoutes);

app.get('/', (request, response) => {
  response.redirect('/cliente');
});

app.listen(3000);

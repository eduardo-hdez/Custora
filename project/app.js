const express = require('express');
const app = express();

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

const clienteRoutes = require('./src/routes/cliente.routes');
const empleadoRoutes = require('./src/routes/empleado.routes');

app.use(express.urlencoded({ extended: true }));

app.use('/cliente', clienteRoutes);
app.use('/empleado', empleadoRoutes);

app.get('/', (request, response) => {
  response.redirect('/cliente');
});

app.listen(3000);

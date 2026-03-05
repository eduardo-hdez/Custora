const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  response.render('empleado/catalogo_productos', { title: 'Catalogo de Productos' });
});

router.get('/catalogo', (request, response) => {
  response.render('empleado/catalogo_productos', { title: 'Catalogo de Productos' });
});

router.get('/gestion_productos', (request, response) => {
  response.render('empleado/gestion_productos', { title: 'Gestión de Productos' });
});

module.exports = router;

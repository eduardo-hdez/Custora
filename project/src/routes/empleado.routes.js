const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  response.render('empleado/catalogo_productos', { title: 'Catalogo de Productos' });
});

router.get('/catalogo', (request, response) => {
  response.render('empleado/catalogo_productos', { title: 'Catalogo de Productos' });
});

module.exports = router;

(function () {
  const input = document.getElementById('navbar-search-input');
  const btn = document.getElementById('navbar-search-btn');
  const enCatalogo = window.location.pathname === '/cliente/catalogo' || 
                   window.location.pathname === '/empleado/catalogo';

  const rutaCatalogo = window.location.pathname.startsWith('/cliente') 
  ? '/cliente/catalogo' 
  : '/empleado/catalogo';

  // Al cargar el catálogo, leer ?q= y aplicar filtro
  if (enCatalogo) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    if (q) {
      input.value = q;
     setTimeout(function () {
      filtrarProductos(q);
    }, 300);
  }

    // Filtro en tiempo real
    input.addEventListener('input', function () {
      filtrarProductos(input.value);
    });
  }

  // Botón buscar
  btn.addEventListener('click', function () {
    buscar();
  });

  // Enter en el input
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') buscar();
  });

  function buscar() {
  const q = input.value.trim();
  if (enCatalogo) {
    filtrarProductos(q);
  } else {
    window.location.href = rutaCatalogo + '?q=' + encodeURIComponent(q);
  }
}

  function filtrarProductos(q) {
  const termino = q.toLowerCase().trim();
  const tarjetas = document.querySelectorAll('[data-producto-card]');

  tarjetas.forEach(function (card) {
    const nombre = (card.querySelector('[data-producto-card] a.text-\\[\\#007185\\]')?.textContent || 
                   card.querySelector('a')?.textContent || '').toLowerCase().trim();
    const descripcion = (card.querySelector('p')?.textContent || '').toLowerCase().trim();
    const coincide = termino === '' || nombre.includes(termino) || descripcion.includes(termino);
    card.style.display = coincide ? '' : 'none';
  });
}
})();
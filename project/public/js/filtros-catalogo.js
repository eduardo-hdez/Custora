document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('aside input[type="checkbox"]');
  const tarjetas = document.querySelectorAll('[data-producto-card]');

  function aplicarFiltros() {
    const filtrosSeleccionados = {
      unidad: [],
      categoria: []
    };

    checkboxes.forEach(cb => {
      if (cb.checked) {
        const grupo = cb.dataset.filterGroup;
        if (filtrosSeleccionados[grupo]) {
          filtrosSeleccionados[grupo].push(cb.value.toLowerCase());
        }
      }
    });

    const hayFiltroUnidad = filtrosSeleccionados.unidad.length > 0;
    const hayFiltroCategoria = filtrosSeleccionados.categoria.length > 0;

    tarjetas.forEach(tarjeta => {
      let cumpleUnidad = true;
      let cumpleCategoria = true;

      // Evaluar Unidad
      if (hayFiltroUnidad) {
        const unidadTarjeta = tarjeta.dataset.unidad || '';
        cumpleUnidad = filtrosSeleccionados.unidad.some(filtro => unidadTarjeta.includes(filtro));
      }

      // Evaluar Categoría (búsqueda en nombre y descripción)
      if (hayFiltroCategoria) {
        const searchTexto = tarjeta.dataset.search || '';
        cumpleCategoria = filtrosSeleccionados.categoria.some(filtro => searchTexto.includes(filtro));
      }

      // Mostrar solo si cumple ambos grupos de filtros (AND entre grupos, OR dentro de cada grupo)
      if (cumpleUnidad && cumpleCategoria) {
        tarjeta.dataset.filteredOut = "false";
      } else {
        tarjeta.dataset.filteredOut = "true";
      }
    });

    // Notificar a la paginación que los filtros han cambiado
    if (typeof window.actualizarPaginacion === 'function') {
      window.actualizarPaginacion();
    } else {
      // Si no hay paginación, aplicar los estilos directamente
      tarjetas.forEach(t => {
        t.style.display = t.dataset.filteredOut === 'true' ? 'none' : '';
      });
    }
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', aplicarFiltros);
  });
});

const modalErrorGestion = document.getElementById('modalErrorGestion');
const btnModalErrorGestion = document.getElementById('btnModalErrorGestion');

if (modalErrorGestion && btnModalErrorGestion) {
  const ocultarModalGestion = () => {
    modalErrorGestion.classList.add('hidden');
  };

  btnModalErrorGestion.addEventListener('click', ocultarModalGestion);
  modalErrorGestion.addEventListener('click', (e) => {
    if (e.target === modalErrorGestion) {
      ocultarModalGestion();
    }
  });
}

const modalErrorHabilitado = document.getElementById('modalErrorHabilitado');
const btnModalErrorHabilitado = document.getElementById('btnModalErrorHabilitado');

if (modalErrorHabilitado && btnModalErrorHabilitado) {
  const ocultarModalErrorHabilitado = () => {
    modalErrorHabilitado.classList.add('hidden');
  };

  btnModalErrorHabilitado.addEventListener('click', ocultarModalErrorHabilitado);
  modalErrorHabilitado.addEventListener('click', (e) => {
    if (e.target === modalErrorHabilitado) {
      ocultarModalErrorHabilitado();
    }
  });
}

const modalDeshabilitar = document.getElementById('modalDeshabilitar');
const btnCancelarDeshabilitar = document.getElementById('btnCancelarDeshabilitar');
const btnConfirmarDeshabilitar = document.getElementById('btnConfirmarDeshabilitar');
const formHabilitado = document.getElementById('form-habilitado');
const modalNoSeleccion = document.getElementById('modalNoSeleccion');
const btnModalNoSeleccion = document.getElementById('btnModalNoSeleccion');

const mostrarModalDeshabilitar = () => {
  if (modalDeshabilitar) {
    modalDeshabilitar.classList.remove('hidden');
    modalDeshabilitar.classList.add('flex');
  }
};

const ocultarModalDeshabilitar = () => {
  if (modalDeshabilitar) {
    modalDeshabilitar.classList.add('hidden');
    modalDeshabilitar.classList.remove('flex');
  }
};

const mostrarModalNoSeleccion = () => {
  if (modalNoSeleccion) {
    modalNoSeleccion.classList.remove('hidden');
    modalNoSeleccion.classList.add('flex');
  }
};

const ocultarModalNoSeleccion = () => {
  if (modalNoSeleccion) {
    modalNoSeleccion.classList.add('hidden');
    modalNoSeleccion.classList.remove('flex');
  }
};

if (modalNoSeleccion && btnModalNoSeleccion) {
  btnModalNoSeleccion.addEventListener('click', ocultarModalNoSeleccion);
  modalNoSeleccion.addEventListener('click', (e) => {
    if (e.target === modalNoSeleccion) {
      ocultarModalNoSeleccion();
    }
  });
}

if (btnCancelarDeshabilitar) {
  btnCancelarDeshabilitar.addEventListener('click', ocultarModalDeshabilitar);
}

if (btnConfirmarDeshabilitar && formHabilitado) {
  btnConfirmarDeshabilitar.addEventListener('click', () => {
    formHabilitado.action = '/empleado/gestion-productos/deshabilitar';
    formHabilitado.submit();
  });
}

if (modalDeshabilitar) {
  modalDeshabilitar.addEventListener('click', (e) => {
    if (e.target === modalDeshabilitar) {
      ocultarModalDeshabilitar();
    }
  });
}

function confirmarDeshabilitacion() {
  const seleccionados = document.querySelectorAll('.checkbox-deshabilitar:checked');
  if (seleccionados.length === 0) {
    mostrarModalNoSeleccion();
    return;
  }
  mostrarModalDeshabilitar();
}

const btnDeshabilitar = document.getElementById('btnDeshabilitar');
if (btnDeshabilitar) {
  btnDeshabilitar.addEventListener('click', confirmarDeshabilitacion);
}

document.querySelectorAll('.btn-deshabilitar-producto').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.checkbox-deshabilitar').forEach((cb) => {
      cb.checked = false;
    });

    const row = e.currentTarget.closest('tr');
    if (row) {
      const checkbox = row.querySelector('.checkbox-deshabilitar');
      if (checkbox) checkbox.checked = true;
    }

    confirmarDeshabilitacion();
  });
});

const modalRehabilitar = document.getElementById('modalRehabilitar');
const btnCancelarRehabilitar = document.getElementById('btnCancelarRehabilitar');
const btnConfirmarRehabilitar = document.getElementById('btnConfirmarRehabilitar');

const mostrarModalRehabilitar = () => {
  if (modalRehabilitar) {
    modalRehabilitar.classList.remove('hidden');
    modalRehabilitar.classList.add('flex');
  }
};

const ocultarModalRehabilitar = () => {
  if (modalRehabilitar) {
    modalRehabilitar.classList.add('hidden');
    modalRehabilitar.classList.remove('flex');
  }
};

if (btnCancelarRehabilitar) {
  btnCancelarRehabilitar.addEventListener('click', ocultarModalRehabilitar);
}

if (btnConfirmarRehabilitar && formHabilitado) {
  btnConfirmarRehabilitar.addEventListener('click', () => {
    formHabilitado.action = '/empleado/gestion-productos/rehabilitar';
    formHabilitado.submit();
  });
}

if (modalRehabilitar) {
  modalRehabilitar.addEventListener('click', (e) => {
    if (e.target === modalRehabilitar) {
      ocultarModalRehabilitar();
    }
  });
}

function confirmarRehabilitacion() {
  const seleccionados = document.querySelectorAll('.checkbox-rehabilitar:checked');
  if (seleccionados.length === 0) {
    mostrarModalNoSeleccion();
    return;
  }
  mostrarModalRehabilitar();
}

const btnRehabilitar = document.getElementById('btnRehabilitar');
if (btnRehabilitar) {
  btnRehabilitar.addEventListener('click', confirmarRehabilitacion);
}

document.querySelectorAll('.btn-rehabilitar-producto').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.checkbox-rehabilitar').forEach((cb) => {
      cb.checked = false;
    });

    const row = e.currentTarget.closest('tr');
    if (row) {
      const checkbox = row.querySelector('.checkbox-rehabilitar');
      if (checkbox) checkbox.checked = true;
    }

    confirmarRehabilitacion();
  });
});

const busquedaProducto = document.getElementById('busquedaProducto');
const filtroEstado = document.getElementById('filtroEstado');
const filtroUnidad = document.getElementById('filtroUnidad');
const filas = document.querySelectorAll('tbody tr');

function aplicarFiltros() {
  if (!busquedaProducto || !filtroEstado || !filtroUnidad) return;

  const busqueda = busquedaProducto.value.trim().toLowerCase();
  const estado = filtroEstado.value;
  const unidad = filtroUnidad.value.trim().toLowerCase();

  filas.forEach((fila) => {
    if (!fila.hasAttribute('data-estado')) return;

    const nombreProducto = fila.dataset.nombre || '';
    const cumpleBusqueda = !busqueda || nombreProducto.includes(busqueda);
    const cumpleEstado = !estado || fila.dataset.estado === estado;
    const filaUnidad = fila.dataset.unidad ? fila.dataset.unidad.toLowerCase() : '';
    const cumpleUnidad = !unidad || filaUnidad.startsWith(unidad);

    fila.style.display = cumpleBusqueda && cumpleEstado && cumpleUnidad ? '' : 'none';
  });
}

if (busquedaProducto) busquedaProducto.addEventListener('input', aplicarFiltros);
if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
if (filtroUnidad) filtroUnidad.addEventListener('change', aplicarFiltros);
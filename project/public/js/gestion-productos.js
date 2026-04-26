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

const modalErrorCargaMasiva = document.getElementById('modalErrorCargaMasiva');
const btnModalErrorCargaMasiva = document.getElementById('btnModalErrorCargaMasiva');

if (modalErrorCargaMasiva && btnModalErrorCargaMasiva) {
  const ocultarModalErrorCargaMasiva = () => {
    modalErrorCargaMasiva.classList.add('hidden');
  };

  btnModalErrorCargaMasiva.addEventListener('click', ocultarModalErrorCargaMasiva);
  modalErrorCargaMasiva.addEventListener('click', (e) => {
    if (e.target === modalErrorCargaMasiva) {
      ocultarModalErrorCargaMasiva();
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
const filas = Array.from(document.querySelectorAll('tbody tr[data-estado]'));
const filasPorPagina = 15;
let paginaActual = 1;
let filasFiltradas = [...filas];

const textoResumenPaginacion = document.querySelector('.bg-gray-50 p.text-sm.text-gray-700');
const spansResumenPaginacion = textoResumenPaginacion ?
  textoResumenPaginacion.querySelectorAll('.font-medium') :
  [];
const navPaginacion = document.querySelector('nav[aria-label="Pagination"]');
const tablaGestion = document.getElementById('form-habilitado');

function desplazarAlInicioProductosGestion() {
  if (!tablaGestion) return;
  tablaGestion.scrollIntoView({behavior: 'smooth', block: 'start'});
}

function crearBotonPaginacion({label, disabled = false, activo = false, onClick, ariaLabel = ''}) {
  const boton = document.createElement('button');
  boton.type = 'button';

  const clasesBase = 'relative inline-flex items-center border border-gray-300 bg-white text-sm font-medium';
  const clasesActivo = activo ? 'text-[#007185] bg-teal-50' : 'text-gray-700 hover:bg-gray-50';
  const clasesDisabled = disabled ? 'text-gray-400 cursor-not-allowed' : '';
  const clasesPadding = label === 'chevron_left' || label === 'chevron_right' ? 'px-2 py-2' : 'px-4 py-2';
  boton.className = `${clasesBase} ${clasesActivo} ${clasesDisabled} ${clasesPadding}`;

  if (ariaLabel) {
    boton.setAttribute('aria-label', ariaLabel);
  }
  if (disabled) {
    boton.disabled = true;
  } else if (typeof onClick === 'function') {
    boton.addEventListener('click', onClick);
  }

  if (label === 'chevron_left' || label === 'chevron_right') {
    const icono = document.createElement('span');
    icono.className = 'material-icons text-sm';
    icono.textContent = label;
    boton.appendChild(icono);
  } else {
    boton.textContent = label;
  }

  return boton;
}

function renderControlesPaginacion() {
  if (!navPaginacion) return;

  navPaginacion.innerHTML = '';
  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / filasPorPagina));

  const botonAnterior = crearBotonPaginacion({
    label: 'chevron_left',
    disabled: paginaActual === 1 || filasFiltradas.length === 0,
    ariaLabel: 'Anterior',
    onClick: () => {
      if (paginaActual > 1) {
        paginaActual -= 1;
        renderPagina();
        desplazarAlInicioProductosGestion();
      }
    },
  });
  botonAnterior.classList.add('rounded-l-md');

  const botonSiguiente = crearBotonPaginacion({
    label: 'chevron_right',
    disabled: paginaActual === totalPaginas || filasFiltradas.length === 0,
    ariaLabel: 'Siguiente',
    onClick: () => {
      if (paginaActual < totalPaginas) {
        paginaActual += 1;
        renderPagina();
        desplazarAlInicioProductosGestion();
      }
    },
  });
  botonSiguiente.classList.add('rounded-r-md');

  navPaginacion.appendChild(botonAnterior);
  for (let i = 1; i <= totalPaginas; i += 1) {
    const botonPagina = crearBotonPaginacion({
      label: String(i),
      activo: i === paginaActual,
      onClick: () => {
        paginaActual = i;
        renderPagina();
        desplazarAlInicioProductosGestion();
      },
    });
    navPaginacion.appendChild(botonPagina);
  }
  navPaginacion.appendChild(botonSiguiente);
}

function actualizarResumenPaginacion() {
  if (spansResumenPaginacion.length < 3) return;

  const totalResultados = filasFiltradas.length;
  const inicio = totalResultados === 0 ? 0 : ((paginaActual - 1) * filasPorPagina) + 1;
  const fin = totalResultados === 0 ? 0 : Math.min(paginaActual * filasPorPagina, totalResultados);

  spansResumenPaginacion[0].textContent = String(inicio);
  spansResumenPaginacion[1].textContent = String(fin);
  spansResumenPaginacion[2].textContent = String(totalResultados);
}

function renderPagina() {
  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / filasPorPagina));
  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  filas.forEach((fila) => {
    fila.style.display = 'none';
  });

  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  filasFiltradas.slice(inicio, fin).forEach((fila) => {
    fila.style.display = '';
  });

  actualizarResumenPaginacion();
  renderControlesPaginacion();
}

function aplicarFiltros() {
  if (!busquedaProducto || !filtroEstado || !filtroUnidad) return;

  const busqueda = busquedaProducto.value.trim().toLowerCase();
  const estado = filtroEstado.value;
  const unidad = filtroUnidad.value.trim().toLowerCase();

  filasFiltradas = filas.filter((fila) => {
    const nombreProducto = fila.dataset.nombre || '';
    const cumpleBusqueda = !busqueda || nombreProducto.includes(busqueda);
    const cumpleEstado = !estado || fila.dataset.estado === estado;
    const filaUnidad = fila.dataset.unidad ? fila.dataset.unidad.toLowerCase() : '';
    const cumpleUnidad = !unidad || filaUnidad.startsWith(unidad);

    return cumpleBusqueda && cumpleEstado && cumpleUnidad;
  });

  paginaActual = 1;
  renderPagina();
}

if (busquedaProducto) busquedaProducto.addEventListener('input', aplicarFiltros);
if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
if (filtroUnidad) filtroUnidad.addEventListener('change', aplicarFiltros);

// Script de Carga Masiva
const inputCargaMasiva = document.getElementById('cargaMasiva');
const labelCargaMasiva = document.getElementById('labelCargaMasiva');
const infoCargaMasiva = document.getElementById('infoCargaMasiva');
const nombreArchivoCarga = document.getElementById('nombreArchivoCarga');
const btnQuitarArchivo = document.getElementById('btnQuitarArchivo');
const btnRegistrarCarga = document.getElementById('btnRegistrarCarga');

function mostrarEstadoArchivo() {
  if (!inputCargaMasiva || !inputCargaMasiva.files.length) return;

  const archivo = inputCargaMasiva.files[0];
  nombreArchivoCarga.textContent = archivo.name;

  //ocultar
  labelCargaMasiva.classList.add('hidden');
  infoCargaMasiva.classList.remove('hidden');
  infoCargaMasiva.classList.add('flex');
  btnRegistrarCarga.classList.remove('hidden');
  btnRegistrarCarga.classList.add('flex');
}

function restaurarEstadoArchivo() {
  if (inputCargaMasiva) inputCargaMasiva.value = '';
  if (nombreArchivoCarga) nombreArchivoCarga.textContent = '';

  //mostrar
  if (labelCargaMasiva) labelCargaMasiva.classList.remove('hidden');
  if (infoCargaMasiva) {
    infoCargaMasiva.classList.add('hidden');
    infoCargaMasiva.classList.remove('flex');
  }
  if (btnRegistrarCarga) {
    btnRegistrarCarga.classList.add('hidden');
    btnRegistrarCarga.classList.remove('flex');
  }
}

if (inputCargaMasiva) {
  inputCargaMasiva.addEventListener('change', mostrarEstadoArchivo);
}

if (btnQuitarArchivo) {
  btnQuitarArchivo.addEventListener('click', restaurarEstadoArchivo);
}

if (filas.length > 0) {
  renderPagina();
}
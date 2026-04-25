const gridCatalogo = document.querySelector('[data-catalogo-grid]');
const contenedorPaginacion = document.querySelector('[data-catalogo-paginacion]');

if (gridCatalogo && contenedorPaginacion) {
  const tarjetas = Array.from(gridCatalogo.querySelectorAll('[data-producto-card]'));
  const tamanioPagina = Number(gridCatalogo.dataset.pageSize) || 20;
  let paginaActual = 1;

  const totalPaginas = () => Math.max(1, Math.ceil(tarjetas.length / tamanioPagina));

  const crearBoton = (texto, {activo = false, deshabilitado = false, onClick} = {}) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = texto;
    boton.className = `px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
      activo
        ? 'bg-[#007185] border-[#007185] text-white'
        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
    }`;

    if (deshabilitado) {
      boton.disabled = true;
      boton.classList.add('opacity-50', 'cursor-not-allowed');
    } else if (typeof onClick === 'function') {
      boton.addEventListener('click', onClick);
    }

    return boton;
  };

  const desplazarAlInicioProductos = () => {
    gridCatalogo.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const renderPagina = ({desplazar = false} = {}) => {
    const inicio = (paginaActual - 1) * tamanioPagina;
    const fin = inicio + tamanioPagina;

    tarjetas.forEach((tarjeta, index) => {
      tarjeta.style.display = index >= inicio && index < fin ? '' : 'none';
    });

    contenedorPaginacion.innerHTML = '';
    if (tarjetas.length <= tamanioPagina) return;

    contenedorPaginacion.appendChild(
      crearBoton('Anterior', {
        deshabilitado: paginaActual === 1,
        onClick: () => {
          if (paginaActual > 1) {
            paginaActual -= 1;
            renderPagina({desplazar: true});
          }
        },
      }),
    );

    for (let pagina = 1; pagina <= totalPaginas(); pagina += 1) {
      contenedorPaginacion.appendChild(
        crearBoton(String(pagina), {
          activo: pagina === paginaActual,
          onClick: () => {
            paginaActual = pagina;
            renderPagina({desplazar: true});
          },
        }),
      );
    }

    contenedorPaginacion.appendChild(
      crearBoton('Siguiente', {
        deshabilitado: paginaActual === totalPaginas(),
        onClick: () => {
          if (paginaActual < totalPaginas()) {
            paginaActual += 1;
            renderPagina({desplazar: true});
          }
        },
      }),
    );

    if (desplazar) {
      desplazarAlInicioProductos();
    }
  };

  renderPagina();
}

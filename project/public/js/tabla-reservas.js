// Script de modal informativo de error en la recuperación de datos de las reservas
const modalErrorRecuperacion = document.getElementById('modalErrorRecuperacion');
const btnModalErrorRecuperacion = document.getElementById('btnModalErrorRecuperacion');

if (modalErrorRecuperacion && btnModalErrorRecuperacion) {
    function ocultarModalRecuperacion() {
        modalErrorRecuperacion.classList.add('hidden');
    }
    btnModalErrorRecuperacion.addEventListener('click', ocultarModalRecuperacion);
    modalErrorRecuperacion.addEventListener('click', (e) => {
        if (e.target === modalErrorRecuperacion) {
            ocultarModalRecuperacion();
        }
    });
}
// Script de filtros de búsqueda
document.getElementById('botonFiltrar').addEventListener('click', aplicarFiltros);
const reservas = document.querySelectorAll('.card-reserva');
const busquedaGeneral = document.getElementById('busquedaGeneral');
const filtroEstado = document.getElementById('filtroEstado');
const filtroFechaInicio = document.getElementById('filtroFechaInicio');
const filtroFechaFin = document.getElementById('filtroFechaFin');

//Filtrar si el usuario presiona Enter en el input de búsqueda
busquedaGeneral.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') aplicarFiltros();
});

//Filtrar automáticamente al cambiar el estado
filtroEstado.addEventListener('change', aplicarFiltros);

function convertirFecha(fechaTexto) { //convertir dato de fecha de texto a formato aaaa-mm-dd para comparar
    if (!fechaTexto) return '';
    const partes = fechaTexto.split('/');
    if (partes.length === 3) {
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const anio = partes[2];
        return `${anio}-${mes}-${dia}`;
    }
    return fechaTexto;
}
// Función para aplicar filtros
function aplicarFiltros() {
    const inputGeneral = busquedaGeneral.value.trim().toLowerCase();
    const estadoSeleccionado = filtroEstado.value;
    const fechaInicio = filtroFechaInicio.value;
    const fechaFin = filtroFechaFin.value;

    reservas.forEach(reserva => {
        if (!reserva.hasAttribute('data-estado')) return;

        //Barra de búsqueda para coincidencias en folio, concesionaria, sucursal o nombre de los productos
        const folioReserva = reserva.dataset.folio ? reserva.dataset.folio.toLowerCase() : '';
        const nombreConcesionaria = reserva.dataset.concesionaria ? reserva.dataset.concesionaria.toLowerCase() : '';
        const nombreSucursal = reserva.dataset.sucursal ? reserva.dataset.sucursal.toLowerCase() : '';
        const nombresProductos = reserva.dataset.productos ? reserva.dataset.productos.toLowerCase() : '';

        const cumpleBusqueda = !inputGeneral ||
            folioReserva.includes(inputGeneral) ||
            nombreConcesionaria.includes(inputGeneral) ||
            nombreSucursal.includes(inputGeneral) ||
            nombresProductos.includes(inputGeneral);

        //Filtro de estado
        const cumpleEstado = !estadoSeleccionado || estadoSeleccionado === 'todas' || reserva.dataset.estado === estadoSeleccionado;

        //Filtro de rango de fechas
        const fechaReserva = convertirFecha(reserva.dataset.fechaReserva);
        let cumpleFecha = true;
        if (fechaInicio && fechaReserva) {
            cumpleFecha = cumpleFecha && fechaReserva >= fechaInicio;
        }
        if (fechaFin && fechaReserva) {
            cumpleFecha = cumpleFecha && fechaReserva <= fechaFin;
        }

        reserva.style.display = cumpleBusqueda && cumpleEstado && cumpleFecha ? '' : 'none';
    });
}

// Script de despliegue/minimización de las reservas
document.querySelectorAll('.encabezado-reserva').forEach(encabezado => {
    encabezado.addEventListener('click', function () {
        const card = this.closest('.card-reserva');
        const contenido = card.querySelector('.contenido-reserva');
        const flecha = this.querySelector('.flecha-despliegue');

        contenido.classList.toggle('hidden');

        if (contenido.classList.contains('hidden')) {
            flecha.style.transform = 'rotate(0deg)';
        } else {
            flecha.style.transform = 'rotate(180deg)';
        }
    });
});
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
const busquedaFolio = document.getElementById('busquedaFolio');
const busquedaConcesionaria = document.getElementById('busquedaConcesionaria');
const busquedaSucursal = document.getElementById('busquedaSucursal');
const filtroEstado = document.getElementById('filtroEstado');
const filtroFecha = document.getElementById('filtroFecha');

// También filtramos si el usuario presiona Enter en los inputs de búsqueda
[busquedaConcesionaria, busquedaSucursal, busquedaFolio].forEach(input => {
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') aplicarFiltros();
    });
});

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
    const inputFolio = busquedaFolio.value.trim().toLowerCase();
    const inputConcesionaria = busquedaConcesionaria.value.trim().toLowerCase();
    const inputSucursal = busquedaSucursal.value.trim().toLowerCase();
    const estadoSeleccionado = filtroEstado.value;
    const fechaSeleccionada = filtroFecha.value;

    reservas.forEach(reserva => {
        if (!reserva.hasAttribute('data-estado')) return;

        const folioReserva = reserva.dataset.folio ? reserva.dataset.folio.toLowerCase() : '';
        const cumpleFolio = !inputFolio || folioReserva.includes(inputFolio);

        const nombreConcesionaria = reserva.dataset.concesionaria ? reserva.dataset.concesionaria.toLowerCase() : '';
        const cumpleConcesionaria = !inputConcesionaria || nombreConcesionaria.includes(inputConcesionaria);

        const nombreSucursal = reserva.dataset.sucursal ? reserva.dataset.sucursal.toLowerCase() : '';
        const cumpleSucursal = !inputSucursal || nombreSucursal.includes(inputSucursal);

        const cumpleEstado = !estadoSeleccionado || estadoSeleccionado === 'todas' || reserva.dataset.estado === estadoSeleccionado;

        const fechaReserva = convertirFecha(reserva.dataset.fechaReserva);
        const cumpleFecha = !fechaSeleccionada || fechaReserva === fechaSeleccionada;

        reserva.style.display = cumpleFolio && cumpleConcesionaria && cumpleSucursal && cumpleEstado && cumpleFecha ? '' : 'none';
    });
}
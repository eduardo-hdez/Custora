import Reserva from '../models/reserva.model.js';
import Carrito from '../models/carrito.model.js';
import Campana from '../models/campana.model.js';
import Producto from '../models/producto.model.js';
import Concesionaria from '../models/concesionaria.model.js';
import { enviarConfirmacionReserva } from '../services/email.service.js';
import { enviarCancelacionReserva } from '../services/email.service.js';

function getFechaBaseReserva(reserva) {
  return reserva?.fecha_hora_reserva || reserva?.fecha_reserva;
}

function getCampanaId(reserva) {
  return reserva?.id_campana ?? reserva?.['id_campana'] ?? null;
}

function calcularCancelacion(reserva, minutosVentana) {
  const ahora = Date.now();
  const fechaBase = getFechaBaseReserva(reserva);
  const fechaReservaMs = fechaBase ? new Date(fechaBase).getTime() : Number.NaN;
  const minutos = Math.min(Number(minutosVentana) || 20, 20);
  const limiteMs = Number.isFinite(fechaReservaMs) ? (fechaReservaMs + (minutos * 60 * 1000)) : 0;
  const restanteMs = limiteMs - ahora;
  const puedeCancelar = Boolean(reserva?.estado_reserva) && restanteMs > 0;

  const minutosRestantesTotal = Math.max(0, Math.ceil(restanteMs / 60000));
  const horasRestantes = Math.floor(minutosRestantesTotal / 60);
  const minutosRestantes = minutosRestantesTotal % 60;

  return {
    puedeCancelar,
    minutosVentana: minutos,
    minutosRestantes: minutosRestantesTotal,
    horasRestantes,
    minutosRestantesFormato: horasRestantes > 0 ? `${horasRestantes}h ${minutosRestantes}m` : `${minutosRestantes} min`,
  };
}

function mapReservaView(reserva) {
  const productos = Array.isArray(reserva.productos) ? reserva.productos : [];
  let total = 0;
  let pesoTotal = 0;

  const productosView = productos.map((item) => {
    const producto = item.producto || {};
    const cantidad = Number(item.unidades_reservadas) || 0;
    const precio = Number(producto.precio_producto) || 0;
    const peso = Number(producto.peso_unidad) || 0;
    total += precio * cantidad;
    pesoTotal += peso * cantidad;
    return {
      id: producto.id_producto,
      nombre: producto.nombre_producto || 'Producto',
      unidad: producto.unidad_venta_producto || 'Unidad',
      foto: producto.foto_producto || 'https://placehold.co/400x400/ffffff/cccccc?text=Producto',
      cantidad,
    };
  });

  const estadoReserva = reserva.estado_reserva === true || reserva.estado_reserva === 1 || String(reserva.estado_reserva).toLowerCase() === 'true';
  const estadoTexto = estadoReserva ? 'Reserva Confirmada' : 'Reserva Cancelada';
  const cancelacion = calcularCancelacion(reserva, reserva.tiempo_cancelacion);

  return {
    folio: reserva.folio,
    estadoReserva,
    estadoTexto,
    fechaReserva: reserva.fecha_hora_reserva || reserva.fecha_reserva || '',
    fechaCancelacion: reserva.fecha_cancelacion || null,
    sucursal: reserva.nombre_sucursal || 'N/D',
    sucursalUbicacion: reserva.ubicacion_sucursal || 'N/D',
    total,
    pesoTotal,
    productos: productosView,
    ...cancelacion,
  };
}

export async function confirmarReserva(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) return response.redirect('/login');

  const idSucursal = request.body.id_sucursal;
  if (!idSucursal) return response.redirect('/cliente/carrito-reserva');

  const { data: carrito, error: errorCarrito } = await Carrito.getCartById(idConcesionaria);
  if (errorCarrito || !carrito?.id_carrito) return response.redirect('/cliente/carrito-reserva');

  const productos = Array.isArray(carrito.productos_seleccionados) ? carrito.productos_seleccionados : [];
  if (productos.length === 0) return response.redirect('/cliente/carrito-reserva');

  const [folio, campana] = await Promise.all([
    Reserva.generarFolio(),
    Campana.getCampanaActiva(),
  ]);

  // Transacción: Crea la reserva y sus productos con rpc.
  const { error: errorTransaccion } = await Reserva.crearConProductos(
    folio,
    idConcesionaria,
    idSucursal,
    campana?.id_campana,
    productos,
  );
  
  if (errorTransaccion) {
    console.error('[reserva] crearConProductos error:', errorTransaccion);
    return response.redirect('/cliente/carrito-reserva');
  }

  await Carrito.clearCart(carrito.id_carrito);

  const { data: sucursalSeleccionada } = await Concesionaria.getSucursalById(idConcesionaria, idSucursal);

  enviarConfirmacionReserva(request.session.correo, {
    idConcesionaria,
    folio,
    estadoPedido: 'Reserva Confirmada',
    fechaReserva: new Date(),
    sucursalDireccion: sucursalSeleccionada?.ubicacion || 'N/D',
    productos,
  });

  return response.render('cliente/confirmacion-reserva', {
    title: 'Reserva Confirmada',
    folio,
  });
}

export async function getHistorialReservas(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) return response.redirect('/login');

  const page = Math.max(1, Number(request.query.page) || 1);
  const pageSize = 5;
  const { data, total, error } = await Reserva.listarPorCliente(idConcesionaria, { page, pageSize });
  if (error) {
    console.error('[reserva] listarPorCliente error:', error);
    return response.render('cliente/historial-reservas', {
      title: 'Historial de Reservas',
      reservas: [],
      pagination: {
        page: 1,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
        startItem: 0,
        endItem: 0,
        totalItems: 0,
      },
      errorMessage: 'No se pudo cargar el historial de reservas.',
      successMessage: null,
    });
  }

  const reservas = (data || []).map(mapReservaView);
  const totalPages = Math.max(1, Math.ceil((Number(total) || 0) / pageSize));
  const safePage = Math.min(page, totalPages);
  const totalItems = Number(total) || 0;
  const startItem = totalItems === 0 ? 0 : ((safePage - 1) * pageSize) + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);
  const successMessage = request.session.successMessage || null;
  request.session.successMessage = null;
  const errorMessage = null;

  return response.render('cliente/historial-reservas', {
    title: 'Historial de Reservas',
    reservas,
    pagination: {
      page: safePage,
      totalPages,
      hasPrev: safePage > 1,
      hasNext: safePage < totalPages,
      startItem,
      endItem,
      totalItems,
    },
    successMessage,
    errorMessage,
  });
}

export async function getDetalleReserva(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) return response.redirect('/login');

  const folio = request.params.folio;
  if (!folio) return response.redirect('/cliente/historial-reservas');

  const { data: reservaRaw, error: errorDetalle } = await Reserva.obtenerDetallePorFolio(folio, idConcesionaria);
  if (errorDetalle) {
    console.error('[reserva] detalle obtenerDetallePorFolio error:', errorDetalle);
    return response.redirect('/cliente/historial-reservas');
  }

  const reserva = reservaRaw ? mapReservaView(reservaRaw) : null;
  if (!reserva) return response.redirect('/cliente/historial-reservas');

  const idsProducto = reserva.productos.map((item) => item.id).filter(Boolean);
  const { data: resumenCalificaciones } = await Producto.getResumenCalificacionesByProductoIds(idsProducto);
  const resumenPorProducto = new Map(
    (resumenCalificaciones || []).map((item) => [item.id_producto, item]),
  );
  reserva.productos = reserva.productos.map((item) => {
    const resumen = resumenPorProducto.get(item.id);
    return {
      ...item,
      promedioPuntuacion: resumen ? Number(resumen.promedio_puntuacion) : 0,
      totalResenas: resumen ? Number(resumen.total_resenas) : 0,
    };
  });

  return response.render('cliente/detalle-reserva', {
    title: `Detalle de Reserva ${folio}`,
    reserva,
  });
}

export async function postCancelarReserva(request, response) {
  const idConcesionaria = request.session.idConcesionaria;
  if (!idConcesionaria) return response.redirect('/login');

  const folio = request.params.folio;
  if (!folio) {
    return response.redirect('/cliente/historial-reservas');
  }

  const { data: reserva, error } = await Reserva.obtenerPorFolio(folio);
  if (error || !reserva) {
    return response.redirect('/cliente/historial-reservas');
  }

  if (String(reserva.id_concesionaria) !== String(idConcesionaria)) {
    return response.redirect('/cliente/historial-reservas');
  }

  if (!reserva.estado_reserva) {
    return response.redirect('/cliente/historial-reservas');
  }

  const idCampana = getCampanaId(reserva);
  if (!idCampana) {
    return response.redirect('/cliente/historial-reservas');
  }

  const { data: minutosConfigurados, error: errorCampana } = await Reserva.obtenerTiempoCancelacion(idCampana);
  if (errorCampana) {
    console.error('[reserva] obtenerTiempoCancelacion error:', errorCampana);
    return response.redirect('/cliente/historial-reservas');
  }

  const { puedeCancelar } = calcularCancelacion(reserva, minutosConfigurados);
  if (!puedeCancelar) {
    return response.redirect('/cliente/historial-reservas');
  }

  const { data: reservaCancelada, error: errorCancelar } = await Reserva.cancelarPorFolio(folio);
  if (errorCancelar || !reservaCancelada) {
    console.error('[reserva] cancelarPorFolio error:', errorCancelar || 'No se actualizó ninguna reserva.');
    return response.redirect('/cliente/historial-reservas');
  }

  enviarCancelacionReserva(request.session.correo, folio).catch((emailError) => {
    console.error('[reserva] enviarCancelacionReserva error:', emailError);
  });

  request.session.successMessage = 'Cancelacion exitosa';
  return response.redirect('/cliente/historial-reservas');
}

export async function renderTablaReservas(request, response) {
  try {
    const { data, error } = await Reserva.fetchAll();
    if (error) {
      throw error;
    }

    const agrupadasMap = new Map();
    if (data) {
      for (const row of data) {
        if (!agrupadasMap.has(row.folio)) {
          agrupadasMap.set(row.folio, {
            folio: row.folio,
            fecha_reserva: row.fecha_reserva,
            precio_reserva: row.precio_reserva,
            estado_reserva: row.estado_reserva,
            nombre_concesionaria: row.nombre_concesionaria,
            nombre_sucursal: row.nombre_sucursal,
            productos: []
          });
        }
        agrupadasMap.get(row.folio).productos.push({
          id_producto: row.id_producto,
          nombre_producto: row.nombre_producto,
          precio_producto: row.precio_producto,
          foto_producto: row.foto_producto,
          unidad_venta_producto: row.unidad_venta_producto,
          unidades_reservadas: row.unidades_reservadas
        });
      }
    }
    const agrupadas = Array.from(agrupadasMap.values());

    response.render('empleado/tabla-reservas', {
      title: 'Tabla de Reservas',
      reservas: agrupadas,
      errorRecuperacion: null,
    });
  } catch (error) {
    response.status(500).render('empleado/tabla-reservas', {
      title: 'Tabla de Reservas',
      reservas: [],
      errorRecuperacion: 1,
    });
  }
}
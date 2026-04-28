const formatCurrencyMx = (value) => `$${Number(value || 0).toLocaleString('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const formatWeightMx = (value) => `${Number(value || 0).toLocaleString('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})} kg`;

const actualizarResumenCarrito = () => {
  const items = Array.from(document.querySelectorAll('[data-carrito-item]'));
  const totalItems = items.reduce((acc, item) => {
    const cantidad = Number(item.querySelector('[data-cantidad]')?.textContent || 0);
    return acc + Math.max(0, cantidad);
  }, 0);

  const subtotal = items.reduce((acc, item) => {
    const precio = Number(item.dataset.precioUnitario || 0);
    const cantidad = Number(item.querySelector('[data-cantidad]')?.textContent || 0);
    return acc + (precio * Math.max(0, cantidad));
  }, 0);
  const pesoTotal = items.reduce((acc, item) => {
    const peso = Number(item.dataset.pesoUnitario || 0);
    const cantidad = Number(item.querySelector('[data-cantidad]')?.textContent || 0);
    return acc + (peso * Math.max(0, cantidad));
  }, 0);

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const totalItemsEl = document.getElementById('carritoTotalItems');
  const labelItemsEl = document.getElementById('carritoLabelItems');
  const subtotalEl = document.getElementById('carritoSubtotal');
  const ivaEl = document.getElementById('carritoIva');
  const pesoTotalEl = document.getElementById('carritoPesoTotal');
  const totalEl = document.getElementById('carritoTotal');
  const badgeCarritoEl = document.getElementById('navbarCarritoBadge');

  if (totalItemsEl) totalItemsEl.textContent = String(totalItems);
  if (labelItemsEl) labelItemsEl.textContent = totalItems === 1 ? 'producto' : 'productos';
  if (subtotalEl) subtotalEl.textContent = formatCurrencyMx(subtotal);
  if (ivaEl) ivaEl.textContent = formatCurrencyMx(iva);
  if (pesoTotalEl) pesoTotalEl.textContent = formatWeightMx(pesoTotal);
  if (totalEl) totalEl.textContent = formatCurrencyMx(total);
  if (badgeCarritoEl) {
    badgeCarritoEl.textContent = String(totalItems);
    if (totalItems > 0) {
      badgeCarritoEl.classList.remove('hidden');
      badgeCarritoEl.classList.add('flex');
    } else {
      badgeCarritoEl.classList.add('hidden');
      badgeCarritoEl.classList.remove('flex');
    }
  }
};

const actualizarLineaVisual = (item, nuevaCantidad) => {
  const cantidadEl = item.querySelector('[data-cantidad]');
  const totalLineaEl = item.querySelector('[data-linea-total]');
  const precioUnitario = Number(item.dataset.precioUnitario || 0);

  if (cantidadEl) cantidadEl.textContent = String(nuevaCantidad);
  if (totalLineaEl) totalLineaEl.textContent = formatCurrencyMx(precioUnitario * nuevaCantidad);
};

const timersPorProducto = new Map();

const enviarCantidadServidor = async (item, cantidad) => {
  const idProducto = item.dataset.idProducto;
  if (!idProducto) return;

  const botones = item.querySelectorAll('[data-cambiar-cantidad]');
  botones.forEach((btn) => { btn.disabled = true; });

  try {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) {
      headers['x-csrf-token'] = csrfMeta.getAttribute('content');
    }

    const response = await fetch(`/cliente/carrito/actualizar/${encodeURIComponent(idProducto)}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({cantidad}),
    });

    if (!response.ok) {
      window.location.reload();
      return;
    }

    const data = await response.json();
    if (!data?.ok || typeof data.cantidad !== 'number') {
      window.location.reload();
      return;
    }

    actualizarLineaVisual(item, Math.max(1, data.cantidad));
    actualizarResumenCarrito();
  } catch (error) {
    window.location.reload();
  } finally {
    botones.forEach((btn) => { btn.disabled = false; });
  }
};

const programarSyncCantidad = (item, cantidad) => {
  const idProducto = item.dataset.idProducto;
  if (!idProducto) return;

  if (timersPorProducto.has(idProducto)) {
    clearTimeout(timersPorProducto.get(idProducto));
  }

  const timer = setTimeout(() => {
    timersPorProducto.delete(idProducto);
    enviarCantidadServidor(item, cantidad);
  }, 300);

  timersPorProducto.set(idProducto, timer);
};

document.querySelectorAll('[data-carrito-item]').forEach((item) => {
  item.querySelectorAll('[data-cambiar-cantidad]').forEach((button) => {
    button.addEventListener('click', () => {
      const accion = button.dataset.cambiarCantidad;
      if (accion !== '+' && accion !== '-') return;

      const cantidadEl = item.querySelector('[data-cantidad]');
      const cantidadActual = Number(cantidadEl?.textContent || 1);
      const nuevaCantidad = accion === '+' ? cantidadActual + 1 : Math.max(1, cantidadActual - 1);
      if (nuevaCantidad === cantidadActual) return;

      actualizarLineaVisual(item, nuevaCantidad);
      actualizarResumenCarrito();
      programarSyncCantidad(item, nuevaCantidad);
    });
  });
});

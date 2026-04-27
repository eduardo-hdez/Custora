  const modalDeshabilitar = document.getElementById('modalDeshabilitar');
  const btnCancelarDeshabilitar = document.getElementById('btnCancelarDeshabilitar');
  const btnConfirmarDeshabilitar = document.getElementById('btnConfirmarDeshabilitar');

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

  if (btnCancelarDeshabilitar) {
    btnCancelarDeshabilitar.addEventListener('click', ocultarModalDeshabilitar);
  }

  if (modalDeshabilitar) {
    modalDeshabilitar.addEventListener('click', (e) => {
      if (e.target === modalDeshabilitar) ocultarModalDeshabilitar();
    });
  }

 document.querySelectorAll('.btn-deshabilitar').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const idProducto = e.currentTarget.dataset.id;
    document.getElementById('inputIdProducto').value = idProducto;
    mostrarModalDeshabilitar();
  });
});

  if (btnConfirmarDeshabilitar) {
    btnConfirmarDeshabilitar.addEventListener('click', () => {
      document.getElementById('formDeshabilitar').submit();
    });
  }

  const modalErrorModificar = document.getElementById('modalErrorModificar');
  const btnModalErrorModificar = document.getElementById('btnModalErrorModificar');

  if (modalErrorModificar && btnModalErrorModificar) {
    const ocultarModalErrorModificar = () => {
      modalErrorModificar.classList.add('hidden');
    };

    btnModalErrorModificar.addEventListener('click', ocultarModalErrorModificar);
    modalErrorModificar.addEventListener('click', (e) => {
      if (e.target === modalErrorModificar) ocultarModalErrorModificar();
    });
  }

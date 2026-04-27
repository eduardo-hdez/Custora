 const modalError = document.getElementById('modalError');
    const btnModalError = document.getElementById('btnModalError');
    if (modalError && btnModalError) {
      function ocultarModal() {
        modalError.classList.add('hidden');
      }
      btnModalError.addEventListener('click', ocultarModal);
      modalError.addEventListener('click', (e) => {
        if (e.target === modalError) ocultarModal();
      });
    }

    const btnGuardarCambios = document.getElementById('btnGuardarCambios');
    const modalConfirmarEdicion = document.getElementById('modalConfirmarEdicion');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    const btnConfirmarEdicion = document.getElementById('btnConfirmarEdicion');
    const formEditar = document.getElementById('forma');

    const mostrarModalEdicion = () => {
      if (modalConfirmarEdicion) {
        modalConfirmarEdicion.classList.remove('hidden');
        modalConfirmarEdicion.classList.add('flex');
      }
    };

    const ocultarModalEdicion = () => {
      if (modalConfirmarEdicion) {
        modalConfirmarEdicion.classList.add('hidden');
        modalConfirmarEdicion.classList.remove('flex');
      }
    };

    if (btnGuardarCambios) {
      btnGuardarCambios.addEventListener('click', (e) => {
        if (formEditar && formEditar.checkValidity()) {
          mostrarModalEdicion();
        } else if (formEditar) {
          formEditar.reportValidity();
        }
      });
    }

    if (btnCancelarEdicion) {
      btnCancelarEdicion.addEventListener('click', ocultarModalEdicion);
    }

    if (modalConfirmarEdicion) {
      modalConfirmarEdicion.addEventListener('click', (e) => {
        if (e.target === modalConfirmarEdicion) ocultarModalEdicion();
      });
    }

    if (btnConfirmarEdicion && formEditar) {
      btnConfirmarEdicion.addEventListener('click', () => {
        formEditar.submit();
      });
    }
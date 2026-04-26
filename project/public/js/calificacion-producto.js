(() => {
  const ratingContainer = document.querySelector('[data-rating-widget]');
  const inputPuntuacion = document.getElementById('puntuacion');
  const ratingLabel = ratingContainer?.querySelector('[data-rating-label]');
  const estrellas = Array.from(ratingContainer?.querySelectorAll('[data-star-value]') || []);
  const form = inputPuntuacion?.closest('form');

  if (!ratingContainer || !inputPuntuacion || estrellas.length === 0) return;

  let valorSeleccionado = Number(ratingContainer.dataset.ratingInitial || inputPuntuacion.value || 0) || 0;

  const textoRating = (valor) => {
    if (!valor) return 'Selecciona una calificación';
    return `${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`;
  };

  const pintarEstrellas = (valor) => {
    estrellas.forEach((estrella) => {
      const valorEstrella = Number(estrella.dataset.starValue || 0);
      const activa = valorEstrella <= valor;
      estrella.classList.toggle('text-amber-400', activa);
      estrella.classList.toggle('text-gray-300', !activa);
      estrella.setAttribute('aria-checked', valorEstrella === valor ? 'true' : 'false');
    });
    if (ratingLabel) ratingLabel.textContent = textoRating(valor);
  };

  const seleccionarValor = (valor) => {
    valorSeleccionado = valor;
    inputPuntuacion.value = String(valor);
    inputPuntuacion.setCustomValidity('');
    pintarEstrellas(valorSeleccionado);
  };

  estrellas.forEach((estrella) => {
    estrella.addEventListener('mouseenter', () => {
      const valor = Number(estrella.dataset.starValue || 0);
      pintarEstrellas(valor);
    });

    estrella.addEventListener('mouseleave', () => {
      pintarEstrellas(valorSeleccionado);
    });

    estrella.addEventListener('click', () => {
      const valor = Number(estrella.dataset.starValue || 0);
      seleccionarValor(valor);
    });
  });

  form?.addEventListener('submit', (event) => {
    if (!inputPuntuacion.value) {
      inputPuntuacion.setCustomValidity('Selecciona una puntuación antes de enviar tu reseña.');
      inputPuntuacion.reportValidity();
      event.preventDefault();
      return;
    }
    inputPuntuacion.setCustomValidity('');
  });

  pintarEstrellas(valorSeleccionado);
})();

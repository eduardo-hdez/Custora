/*cambiar sucursal vía AJAX*/

import {fetchJSON} from './ajax-helper.js';

document.addEventListener('DOMContentLoaded', () => {
  const sucursalCards = document.querySelectorAll('[data-cuenta-id]');

  sucursalCards.forEach(card => {
    card.addEventListener('click', async (e) => {
      if (e.target.closest('button[disabled]')) {
        return;
      }

      const idConcesionaria = card.getAttribute('data-cuenta-id');
      
      if (!idConcesionaria) {
        console.error('No se encontró ID de concesionaria en data-cuenta-id');
        return;
      }

      card.style.opacity = '0.6';
      card.style.pointerEvents = 'none';

      const result = await fetchJSON('POST', '/cliente/cambiar-cuenta', {
        idConcesionaria: idConcesionaria,
      });

      if (result.success) {
        sucursalCards.forEach(c => {
          c.classList.remove('border-[#2B6398]', 'bg-blue-50', 'shadow-md');
          c.classList.add('border-gray-200', 'bg-white');
        });
        
        card.classList.remove('border-gray-200', 'bg-white');
        card.classList.add('border-[#2B6398]', 'bg-blue-50', 'shadow-md');

      } else {
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        console.error('Error al cambiar sucursal:', result.error);
      }

      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    });
  });
});

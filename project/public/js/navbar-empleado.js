(function () {
  const btn = document.getElementById('menu-hamburguesa-empleado');
  const menu = document.getElementById('menu-movil-empleado');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      menu.classList.toggle('hidden');
      menu.classList.toggle('flex');
    });
  }
})();
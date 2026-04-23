//Cuenta atrás hasta data-preventa-fin-ms (epoch ms, fin del último día de campaña en UTC).
(function () {
  const root = document.getElementById('preventa-countdown-root');
  if (!root) return;

  const finAttr = root.getAttribute('data-preventa-fin-ms') || '';
  const finMs = parseInt(finAttr, 10);
  const tieneCampaña = root.getAttribute('data-tiene-campaña') === '1';
  const msgSinCampaña = root.getAttribute('data-msg-sin-campaña') || '';
  const msgSinFecha = root.getAttribute('data-msg-sin-fecha') || '';
  const msgFinalizada = root.getAttribute('data-msg-finalizada') || '';

  const unidades = document.getElementById('preventa-unidades');
  const msg = document.getElementById('preventa-countdown-msg');
  const elD = document.getElementById('cd-d');
  const elH = document.getElementById('cd-h');
  const elM = document.getElementById('cd-m');
  const elS = document.getElementById('cd-s');

  function pad2(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function mostrarSoloMensaje(texto) {
    if (unidades) unidades.style.display = 'none';
    if (msg) {
      msg.textContent = texto;
      msg.style.display = 'block';
    }
  }

  function mostrarUnidades() {
    if (msg) msg.style.display = 'none';
    if (unidades) unidades.style.display = 'flex';
  }

  if (!tieneCampaña) {
    mostrarSoloMensaje(msgSinCampaña);
    return;
  }

  if (!finAttr || Number.isNaN(finMs)) {
    mostrarSoloMensaje(msgSinFecha);
    return;
  }

  let intervalId;

  function tick() {
    const now = Date.now();
    const left = finMs - now;
    if (left <= 0) {
      if (intervalId) clearInterval(intervalId);
      mostrarSoloMensaje(msgFinalizada);
      if (elD) elD.textContent = '00';
      if (elH) elH.textContent = '00';
      if (elM) elM.textContent = '00';
      if (elS) elS.textContent = '00';
      return;
    }

    mostrarUnidades();
    const totalSeg = Math.floor(left / 1000);
    const d = Math.floor(totalSeg / 86400);
    const h = Math.floor((totalSeg % 86400) / 3600);
    const m = Math.floor((totalSeg % 3600) / 60);
    const s = totalSeg % 60;

    if (elD) elD.textContent = pad2(d);
    if (elH) elH.textContent = pad2(h);
    if (elM) elM.textContent = pad2(m);
    if (elS) elS.textContent = pad2(s);
  }

  tick();
  intervalId = setInterval(tick, 1000);
})();

function esperarGraficas() {
  return new Promise((resolve) => {
    const charts = window.__charts || [];
    if (charts.length === 0) return resolve();
    charts.forEach(chart => {
      chart.stop();
      chart.update('none');
    });
    resolve();
  });
}

async function exportarPDF() {
  const elemento = document.getElementById('dashboard-content');
  const btn = document.getElementById('btn-export');
  const btnText = document.getElementById('btn-export-text');

  btn.disabled = true;
  btn.style.visibility = 'hidden';
  btnText.textContent = 'Exportando...';

  await new Promise(resolve => setTimeout(resolve, 100));
  try {
    await esperarGraficas();

    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f9fafb',
      scrollY: -window.scrollY,
      onclone: (documentClone) => {
        documentClone.querySelectorAll('canvas').forEach(c => {
          c.style.display = 'block';
        });
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save('reporte-reservas.pdf');

  } catch (error) {
    console.error('Error al exportar:', error);
    alert('Hubo un error al generar el PDF. Intenta de nuevo.');
  } finally {
    btn.disabled = false;
    btn.style.visibility = 'visible'; 
    btnText.textContent = 'Exportar';
  }
}


  document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-export').addEventListener('click', exportarPDF);
});
    
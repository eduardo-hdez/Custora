const modalError = document.getElementById('modalError');
const btnModalError = document.getElementById('btnModalError');
if (modalError && btnModalError) {
    function ocultarModal() {
        modalError.classList.add('hidden');
    }
    btnModalError.addEventListener('click', ocultarModal);
    modalError.addEventListener('click', (e) => {
        if (e.target === modalError) {
            ocultarModal();
        }
    });
}
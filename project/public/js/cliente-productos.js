document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-cantidad-menos').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = e.target.closest('.qty-container');
            const input = container.querySelector('.input-cantidad');
            const hiddenInput = container.closest('form').querySelector('input[name="cantidad"]');
            let val = parseInt(input.value);
            if (val > 1) {
                val--;
                input.value = val;
                if (hiddenInput) hiddenInput.value = val;
            }
        });
    });

    document.querySelectorAll('.btn-cantidad-mas').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = e.target.closest('.qty-container');
            const input = container.querySelector('.input-cantidad');
            const hiddenInput = container.closest('form').querySelector('input[name="cantidad"]');
            let val = parseInt(input.value);
            val++;
            input.value = val;
            if (hiddenInput) hiddenInput.value = val;
        });
    });

    document.querySelectorAll('.input-cantidad').forEach(input => {
        input.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            e.target.value = val;
            const hiddenInput = e.target.closest('form').querySelector('input[name="cantidad"]');
            if (hiddenInput) hiddenInput.value = val;
        });
    });
});

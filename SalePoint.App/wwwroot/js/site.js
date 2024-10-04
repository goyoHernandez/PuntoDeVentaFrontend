$(() => { 
    setInterval(() => {   
        const url = new URL(`${window.location.origin}/Home/RefreshSession`);

        fetch(url, {
            method: 'GET',
            credentials: 'same-origin' // Asegura que las cookies se envíen con la solicitud
        });
    }, 100000);

    // Inicializa todos los tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    if ($('#companyLogo').attr("src") == '')
        $('#companyLogo').attr("src", localStorage.getItem('pathLogo'));
});

$('#btnChangeLogo').on('click', (e) => {
    $('#uploadLogo').trigger('click');
});


$('#uploadLogo').on('change', (e) => {
    const fileInput = e.currentTarget;
    const formData = new FormData();

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        // Verificar que el archivo sea una imagen
        if (file.type.startsWith('image/')) {
            formData.append('logo', file);

            UploadImageLogo(formData).then((res) => {
                if (res) {
                    // Generar un parámetro único para evitar la caché
                    const uniqueParam = new Date().getTime();

                    localStorage.removeItem('pathLogo');
                    localStorage.setItem('pathLogo', res + '?' + uniqueParam);
                    $('#companyLogo').attr("src", res + '?' + uniqueParam);
                }
            });
        } else {
            // El archivo seleccionado no es una imagen, puedes manejar esto como desees
            Swal.fire({
                title: 'Por favor, selecciona una imagen válida.',
                text: '',
                icon: 'error',
                showCancelButton: false,
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Aceptar'
            })
            // También puedes limpiar el input para que el usuario seleccione nuevamente
            fileInput.value = '';
        }
    }
});

const UploadImageLogo = async (formData) => {
    let data = '';
    const url = new URL(`${window.location.origin}/Home/UploadLogo`);

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    data = await response.json();

    return data;
}
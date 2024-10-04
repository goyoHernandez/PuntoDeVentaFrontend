$(document).on('keyup', (e) => {
    if (e.key === 'Enter' || e.which === 13) {
        $('#btnLogin').trigger('click');
    }
});

$('#btnLogin').on('click', (e) => {
    let access = {
        UserName: document.getElementById('userName').value,
        Pass: document.getElementById('password').value
    };

    if (ValidateFormLogin()) {

        $('#loadingPageLogin').fadeIn(1);

        Login(access).then((res) => {
            
            if (!res.succesful) {

                $('#loadingPageLogin').fadeOut(1);
                dinamicAlert({
                    title: '¡Usuario o Contraseña!',
                    text: 'El usuario o contraseña son incorrectos.',
                    type: 'error'
                });
            }
            else {
                localStorage.setItem('pathLogo', res.pathLogo);
                $('#loadingPageLogin').fadeOut(1);
                window.location.href = `${window.location.origin}/Home/Index`;
            }
        });
    }
});

const ValidateFormLogin = () => {
    let userName = document.getElementById('userName').value;
    let password = document.getElementById('password').value;
    let res = true;

    if (userName == '') {
        dinamycTimerAlert({
            title: '¡Usuario!',
            text: 'El usuario es requerido.',
            type: 'warning'
        });
        return res = false;
    }

    if (password == '' || password.length < 6) {
        dinamycTimerAlert({
            title: '¡Contraseña!',
            text: 'La contraseña es requerida y la longitud es de al menos 6 caracteres.',
            type: 'warning'
        });
        return res = false;
    }

    return res;
}

const dinamicAlert = (settings) => {
    Swal.fire({
        title: settings.title,
        text: settings.text,
        icon: settings.type,
        showCancelButton: false,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Aceptar'
    });
}

let dinamycTimerAlert = (settings) => {
    Swal.fire({
        position: 'top-end',
        icon: settings.type,
        title: settings.title,
        text: settings.text,
        showConfirmButton: false,
        timer: 3000
    });
}

const Login = async (access) => {
    let data = '';
    const url = new URL(`${window.location.origin}/Login`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },      
        body: JSON.stringify(access)
    });
    data = await response.json();

    return data;
}

//const Home = async () => {
//    let data = '';
//    const url = new URL(`${window.location.origin}/Home`);

//    const response = await fetch(url, {
//        method: 'GET',
//        headers: {
//            'Content-Type': 'application/json',
//            'Authorization': 'Bearer <token>'
//        },
//        body: JSON.stringify(access)
//    });
//    data = await response.json();

//    return data;
//}
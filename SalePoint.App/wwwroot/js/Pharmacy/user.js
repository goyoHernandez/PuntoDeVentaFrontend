$(() => {
    $('#loadingPage').fadeIn(1);

    $('#tableUsers').DataTable({
        language: language,
        destroy: true,
        order: [[0, 'desc']],
        scrollX: true,
        scrollCollapse: true,
        searching: false,
        paging: true,
        fixedColumns: {
            'left': 1,
            'right': 1
        },
        lengthMenu: [
            [5, 15, 40, -1],
            [5, 15, 40, 'Todos']
        ],
        initComplete: function () {
            $(this.api().table().container()).find('input').attr('autocomplete', 'off');
        },
        columns: [
            { data: 'name' },
            { data: 'age' },
            { data: 'address' },
            { data: 'cellPhone' },
            { data: 'description' },
            { data: 'rol' },
            { data: 'userName' },
            { data: '' }
        ]
    });
    buildTableUsers();
});

$(document).on('click', '.btnUpdateUser', (e) => {
    $('#loadingPage').fadeIn(1);
    e.currentTarget.disabled = true;
    let userId = e.currentTarget.getAttribute('userId');

    getUserById(userId).then((user) => {
        if (user != null) {
            buildModalUserEdit(user);
        }
        else {
            $('#loadingPage').fadeOut(1);
            dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
        }
    });
});

$(document).on('click', '.btnDeleteUser', (e) => {

    let userId = parseInt(e.currentTarget.getAttribute('userId'));

    Swal.fire({
        title: '¿Estas seguro de eliminar?',
        text: "¡Los cambios no podran revertirse!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {

        if (result.isConfirmed) {
            $('#loadingPage').fadeIn(1);

            deleteUser(userId).then((res) => {

                if (res != null && res > 0) {
                    buildTableUsers();
                    dinamycTimerAlert({ title: '¡Eliminado correctamente!', text: 'El usuario ha sido eliminado', type: 'success' });
                }
                else {
                    $('#loadingPage').fadeOut(1);
                    dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                }
            });
        }
    });
});

$('#btnSaveUser').on('click', (e) => {
    const user = {
        "id": $('#userId').val(),
        "name": $('#name').val(),
        "lastName": $('#lastName').val(),
        "age": $('#age').val(),
        "address": $('#address').val(),
        "cellPhone": $('#cellPhone').val(),
        "description": $('#description').val(),
        "rolId": $('#rol').val(),
        "userName": $('#userName').val(),
        "pass": $('#pass').val(),
        "rol": {
            'id': $('#rol').val(),
            'name': '',
            'description': ''
        }
    };

    if (validateFormSaveUser()) {

        if (user.id == 0) {
            $('#loadingPage').fadeIn(1);

            createUser(user).then((userId) => {

                if (userId != null && userId > 0) {

                    buildTableUsers();
                    $('#btnCloseUserModal').trigger('click');
                    dinamycTimerAlert({ title: '¡Creado correctamente!', text: 'El usuario fue creado.', type: 'success' });
                }
                else {
                    $('#loadingPage').fadeOut(1);
                    dinamycTimerAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                }

            });

        }
        else {
            $('#loadingPage').fadeIn(1);

            updateUser(user).then((userId) => {

                if (userId != null && userId > 0) {

                    buildTableUsers();
                    $('#btnCloseUserModal').trigger('click');
                    dinamycTimerAlert({ title: '¡Actualizado correctamente!', text: 'El usuario fue actualizado.', type: 'success' });
                }
                else {
                    $('#loadingPage').fadeOut(1);
                    dinamycTimerAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                }

            });
        }
    }
});

$('#btnCloseUserModal').on('click', (e) => {
    $('#userModal').modal('hide');
    $('.btnUpdateUser').attr('disabled', false);
});

$('#btnCreateUser').on('click', (e) => {
    $('#titleUserModal').text('Crear usuario');
    clearFormSaveProduct();
    buildSelectRols(0);
    $('#userModal').modal('show');
});

$('#showPassword').on('click', (e) => {
    let pass = $('#pass');

    const type = pass.attr("type") === "password" ? "text" : "password";
    pass.attr("type", type);

    e.currentTarget.classList.toggle('fa-eye');
    e.currentTarget.classList.toggle('fa-eye-slash');
});

const buildTableUsers = () => {

    getAllUsers().then((users) => {

        if (users != null && users.length > 0) {
            let tableUsers = $('#tableUsers').DataTable();
            let data = new Array();
            let userId = $('#userIdLogged').val();

            users.map((item) => {

                let btnUpdateUser = document.createElement('button');
                btnUpdateUser.classList.add('btn', 'btn-secondary', 'mr-1', 'btnUpdateUser');

                let iconUpdate = document.createElement('i');
                iconUpdate.classList.add('fa-solid', 'fa-pen');

                btnUpdateUser.append(iconUpdate);
                btnUpdateUser.setAttribute('userId', item.id);

                let btnDeleteUser = document.createElement('button');
                btnDeleteUser.classList.add('btn', 'btn-danger', 'btnDeleteUser');

                let iconDelete = document.createElement('i');
                iconDelete.classList.add('fa-solid', 'fa-trash');

                btnDeleteUser.append(iconDelete);
                btnDeleteUser.setAttribute('userId', item.id);

                data.push({
                    'name': `${item.name} ${item.lastName}`,
                    'age': item.age,
                    'address': item.address,
                    'cellPhone': item.cellPhone,
                    'description': item.description,
                    'rol': item.rol.name,
                    'userName': item.userName,
                    '': `${btnUpdateUser.outerHTML} ${userId == item.id ? '' : btnDeleteUser.outerHTML}`
                });
            });

            tableUsers.clear().draw();
            tableUsers.rows.add(data); // Add new data
            tableUsers.columns.adjust().draw(); // Redraw the DataTable
            $('#loadingPage').fadeOut(1);
        }
        else {
            tableUsers.clear().draw();
            $('#loadingPage').fadeOut(1);
        }
    });
}

const buildModalUserEdit = (user) => {

    $('#titleUserModal').text('Modificar usuario');
    $('#name').val(user.name);
    $('#lastName').val(user.lastName);
    $('#age').val(user.age);
    $('#address').val(user.address);
    $('#cellPhone').val(user.cellPhone);
    $('#description').val(user.description);
    $('#userName').val(user.userName);
    $('#userId').val(user.id);
    $('#pass').val(user.pass);
    $('#pass').attr('type', 'password');
    $('#showPassword').removeClass('fa-eye');
    $('#showPassword').addClass('fa-eye-slash');
    buildSelectRols(user.rol.id);
    $('#loadingPage').fadeOut(1);

}

const buildSelectRols = (rolId) => {

    getRols().then((rols) => {

        if (rols != null && rols.length > 0) {
            let rol = document.getElementById('rol');
            rol.innerHTML = '';

            if (rolId == 0) {
                let option = document.createElement('option');
                option.value = 0;
                option.innerText = 'Seleccionar un rol';
                rol.appendChild(option);
            }

            rols.map((item) => {
                let option = document.createElement('option');
                option.value = item.id;
                option.innerText = item.name;

                if (rolId > 0 && item.id == rolId)
                    option.selected = true;

                rol.appendChild(option);
            });

            $('#userModal').modal('show');
        }
    });
}

const validateFormSaveUser = () => {
    let name = $('#name').val();
    let lastName = $('#lastName').val();
    let age = $('#age').val();
    let address = $('#address').val();
    let cellPhone = $('#cellPhone').val();
    let description = $('#description').val();
    let userName = $('#userName').val();
    let pass = $('#pass').val();
    let rol = $('#rol').val();
    let response = true;

    if (name == '') {
        dinamycTimerAlert({ title: '¡Nombre!', text: 'El nombre del usuario es requerido.', type: 'error' });
        return response = false;
    }

    if (lastName == '') {
        dinamycTimerAlert({ title: '¡Apellidos!', text: 'Los apellidos del usuario son requeridos.', type: 'error' });
        return response = false;
    }

    if (age == '') {
        dinamycTimerAlert({ title: '¡Edad!', text: 'La edad es requerida.', type: 'error' });
        return response = false;
    }

    if (address == '') {
        dinamycTimerAlert({ title: '¡Dirección!', text: 'La dirección es requerida.', type: 'error' });
        return response = false;
    }

    if (cellPhone == '' || cellPhone.length != 10) {
        dinamycTimerAlert({ title: '¡Numero de celular!', text: 'El numero de celular es requerido y debe ser de 10 digitos.', type: 'error' });
        return response = false;
    }

    if (description == '') {
        dinamycTimerAlert({ title: '¡Descripción!', text: 'La descripción es requerida.', type: 'error' });
        return response = false;
    }

    if (userName == '' || userName.length > 20) {
        dinamycTimerAlert({ title: '¡Nombre de usuario!', text: 'El nombre de usuario es requerido.', type: 'error' });
        return response = false;
    }

    if (pass == '' || pass.length > 20 || pass.length < 8) {
        dinamycTimerAlert({ title: '¡Contraseña!', text: 'La contraseña es requerida y el tamaño minimo es de 8 caracteres y maximo 20.', type: 'error' });
        return response = false;
    }

    if (rol == '' || rol < 1) {
        dinamycTimerAlert({ title: '¡Rol!', text: 'El rol es requerido', type: 'error' });
        return response = false;
    }

    return response;
}

const clearFormSaveProduct = () => {
    $('#name').val('');
    $('#lastName').val('');
    $('#age').val('');
    $('#address').val('');
    $('#description').val('');
    $('#cellPhone').val('');
    $('#userName').val('');
    $('#pass').val('');
    $('#userId').val(0);
    $('#rol').val(0);
}

const dinamicAlert = (settings) => {
    Swal.fire({
        title: settings.title,
        text: settings.text,
        icon: settings.type,
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
    })
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


/* * *  Call API  * */

const getAllUsers = async () => {
    let data = new Array();
    const url = new URL(`${window.location.href}/GetAllUsers`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const getUserById = async (userId) => {
    let data = '';
    const url = new URL(`${window.location.href}/GetUserById`);
    url.searchParams.set('userId', userId);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const createUser = async (user) => {
    let data = '';
    const url = new URL(`${window.location.href}/CreateUser`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    data = await response.json();

    return data;
}

const updateUser = async (user) => {
    let id = '';
    const url = new URL(`${window.location.href}/UpdateUser`);

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(user)
    });

    id = await response.json();

    return id;
}

const deleteUser = async (userId) => {
    let id = '';
    const url = new URL(`${window.location.href}/DeleteUserById`);
    url.searchParams.set('userId', userId);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });

    id = await response.json();
    return id;
}

const getRols = async () => {
    let data = new Array();
    const url = new URL(`${window.location.href}/GetAllRols`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();
    return data;
}
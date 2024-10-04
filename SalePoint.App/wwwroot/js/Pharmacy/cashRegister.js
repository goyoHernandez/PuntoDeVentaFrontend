$(() => {

    $('#loadingPage').fadeIn(1);

    $('#tableCashRegister').DataTable({
        language: language,
        destroy: true,
        info: false,
        order: [[0, 'desc']],
        scrollX: true,
        scrollCollapse: true,
        paging: true,
        fixedColumns: {
            'left': 1,
            'right': 1
        },
        lengthMenu: [
            [5, 15, 40, -1],
            [5, 15, 40, 'Todos']
        ],
        columnDefs: [
            {
                target: 2,
                visible: false
            }
        ],
        columns: [
            { data: 'id' },
            { data: 'userName' },
            { data: 'boxCloseReasonId' },
            { data: 'boxCloseReasonName' },
            { data: 'initialAmount', render: $.fn.dataTable.render.number(',', '.', 2, '$') },
            { data: 'finalAmount', render: $.fn.dataTable.render.number(',', '.', 2, '$') },
            { data: 'gain', render: $.fn.dataTable.render.number(',', '.', 2, '$') },
            { data: 'cashWithdrawal' },
            { data: 'cashIncome' },
            { data: 'startDate' },
            { data: 'endDate' },
            { data: 'action' }
        ]
    });

    $('#tableProductReturns').DataTable({
        language: language,
        destroy: true,
        lengthChange: false,
        info: false,
        ordering: false,
        paging: false,
        scrollX: true,
        lengthMenu: [
            [5, 15, 40, -1],
            [5, 15, 40, 'Todos']
        ],
        columns: [
            { data: 'saleId' },//0
            { data: 'product' },//1
            { data: 'quantity' },//2
            { data: 'unitMeasure' },//3
            { data: 'salePrice', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//4
            { data: 'gain', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//5
            { data: 'saleType' },//6
            { data: 'revenue', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//7
            { data: 'user' },//8
            { data: 'saleDate' },//9
            { data: 'userAppliesReturn' },//10
            { data: 'returnDate' },//11
        ]
    });

    $(document).on('shown.bs.modal', '#modalProductReturnsDetail', function () {
        $($.fn.dataTable.tables(true)).DataTable()
            .columns.adjust()
            .responsive.recalc();
    });

    buildTableCashRegister();
});

$(document).on('click', '.btnCloseCashRegister', (e) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-primary m-2',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: '¡Motivo de cierre!',
        html: `<select class="form-select" id="cmbxBoxcloseReason">
                  <option value="2" selected>Turno finalizado</option>
                  <option value="3">Permiso autorizado</option>
                  <option value="4">Cierre inesperado</option>
                </select>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {

        let boxcloseReasonId = $('#cmbxBoxcloseReason').val();
        let cashRegisterId = e.currentTarget.getAttribute('id-cash-register');
        let cashRegister = {
            'id': cashRegisterId,
            'userId': 0,
            'boxCloseReasonId': boxcloseReasonId
        };

        if (result.isConfirmed) {
            closeCashRegister(cashRegister).then((res) => {

                $('#loadingPage').fadeIn(1);

                if (res != null && res > 0) {
                    buildTableCashRegister();

                    dinamycTimerAlert({
                        title: '¡Caja cerrada!',
                        text: 'La caja fue cerrada con exito.',
                        type: 'success'
                    });
                }
                else {
                    dinamicAlert({
                        title: '¡Ocurrio un error!',
                        text: 'Recargue la pagína e intente nuevamente',
                        type: 'error'
                    });
                }
            });
        }
    })
});

$(document).on('click', '.btnCashWithdrawal', (e) => {

    $('#boxCutId').val(e.currentTarget.getAttribute('id-cash-register'));
    $('#actuallyAmount').val(e.currentTarget.getAttribute('data-id-final-amount'));
    $('#withdrawalAmount').val('');
    $('#reasonWithdrawal').val('');
    $('#modalCashWithdrawal').modal('show');
});

$('#btnApplyCashWithdrawal').on('click', (e) => {
    let finalAmount = parseInt($('#actuallyAmount').val(), 10);

    let cashFlow = {
        'id': 0,
        'boxCutId': $('#boxCutId').val(),
        'cashFlowsTypesId': 1,
        'quantity': $('#withdrawalAmount').val() != '' ? parseInt($('#withdrawalAmount').val(), 10) : 0,
        'reason': $('#reasonWithdrawal').val()
    }

    if (validateFormCashWithdrawal(cashFlow, finalAmount)) {

        $('#loadingPage').fadeIn(1);

        applyCashFlows(cashFlow).then((res) => {
            if (res != null && res > 0) {
                printCashFlowTicket(cashFlow);
                $('#modalCashWithdrawal').modal('hide');
                buildTableCashRegister();
                dinamycTimerAlert({ title: '¡Retiro exitoso!', text: 'El retiro de efectivo se realizo con éxito.', type: 'success' });
            }
            else {
                dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
            }
        });
    }

});

$(document).on('click', '.btnCashIncome', (e) => {

    $('#boxCutId').val(e.currentTarget.getAttribute('id-cash-register'));
    $('#actuallyAmountCashIncome').val(parseInt(e.currentTarget.getAttribute('data-id-final-amount'), 10));
    $('#cashIncome').val('');
    $('#reasonCashIncome').val('');
    $('#modalCashIncome').modal('show');
});

$('#btnApplyCashIncome').on('click', (e) => {

    let cashFlow = {
        'id': 0,
        'boxCutId': $('#boxCutId').val(),
        'cashFlowsTypesId': 2,
        'quantity': parseInt($('#cashIncome').val(), 10),
        'reason': $('#reasonCashIncome').val()
    }

    if (validateFormCashIncome(cashFlow)) {

        $('#loadingPage').fadeIn(1);

        applyCashFlows(cashFlow).then((res) => {
            if (res != null && res > 0) {
                printCashFlowTicket(cashFlow);
                $('#modalCashIncome').modal('hide');

                buildTableCashRegister();
                dinamycTimerAlert({ title: '¡Ingreso exitoso!', text: 'El ingreso de efectivo se realizo con éxito.', type: 'success' });
            }
            else {
                dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
            }
        });
    }

});

$(document).on('click', '.btnCashWithdrawalDetail', (e) => {

    let boxCutId = e.currentTarget.getAttribute('data-cash-register-id');
    $('#titleCashFlowsDetail').text('Retiros de efectivo');

    $('#loadingPage').fadeIn(1);

    getCashFlowsDetail(boxCutId, 1).then((res) => {

        $('#loadingPage').fadeOut(1);

        if (res != null && res.length > 0) {
            buildTableCashFlowsDetail(res);
        }
        else {
            dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
        }
    });
});

$(document).on('click', '.btnCashIncomeDetail', (e) => {

    let boxCutId = e.currentTarget.getAttribute('data-cash-register-id');
    $('#titleCashFlowsDetail').text('Ingresos de efectivo');

    $('#loadingPage').fadeIn(1);

    getCashFlowsDetail(boxCutId, 2).then((res) => {

        if (res != null && res.length > 0) {
            buildTableCashFlowsDetail(res);
            $('#loadingPage').fadeOut(1);
        }
        else {
            dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
        }
    });
});

$(document).on('click', '.btnProductReturnsDetail', (e) => {

    $('#loadingPage').fadeIn(1);

    let boxCutId = e.currentTarget.getAttribute('data-cash-register-id');

    getProductReturnsDetail(boxCutId).then((res) => {

        if (res != null && res.length > 0) {

            buildTableProductReturnsDetail(res);
            $('#loadingPage').fadeOut(1);

        }
        else {
            dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
            $('#loadingPage').fadeOut(1);
        }
    });
});

const buildTableCashRegister = () => {

    getAllCashRegister().then((cashRegisters) => {
        let tableCashRegister = $('#tableCashRegister').DataTable();
        $('#loadingPage').fadeOut(1);

        if (cashRegisters != null && cashRegisters.length > 0) {
            let data = new Array();

            cashRegisters.map((item) => {
                let btnCloseCashRegister = '';
                let btnCashIncome = '';
                let btnCashWithdrawal = '';
                let btnCashWithdrawalDetail = '';
                let btnCashIncomeDetail = '';
                let btnProductReturnsDetail = '';

                if (item.boxCloseReasonId == 1) {
                    btnCashIncome = `<button class="btn btn-success mr-1 btnCashIncome text-white" id-cash-register="${item.id}" data-id-final-amount="${item.finalAmount}" data-toggle="tooltip" data-placement="top" title="Ingresar"><i class="fa-solid fa-dollar-sign"></i></button>`;
                    btnCashWithdrawal = `<button class="btn btn-danger mr-1 btnCashWithdrawal text-white" id-cash-register="${item.id}" data-id-final-amount="${item.finalAmount}" data-toggle="tooltip" data-placement="top" title="Retirar"><i class="fa-solid fa-money-bill-transfer"></i></button>`;
                    btnCloseCashRegister = `<button class="btn btn-secondary mr-1 btnCloseCashRegister" id-cash-register="${item.id}" data-toggle="tooltip" data-placement="top" title="Cerrar caja"><i class="fa-solid fa-lock"></i></button>`;
                }

                btnCashWithdrawalDetail = item.cashWithdrawal == null ? '$0.00' : `<label class="btn-detail-cash-flow btnCashWithdrawalDetail" data-cash-register-id="${item.id}">$${item.cashWithdrawal}</label>`;
                btnCashIncomeDetail = item.cashIncome == null ? '$0.00' : `<label class="btn-detail-cash-flow btnCashIncomeDetail" data-cash-register-id="${item.id}">$${item.cashIncome}</label>`;

                if (item.numberReimbursement > 0)
                    btnProductReturnsDetail = ` <button type="button" class="btn btn-primary position-relative btnProductReturnsDetail" data-cash-register-id="${item.id}">
                                                    <i class="fa-solid fa-box"></i>
                                                    <i class="fa-solid fa-rotate-left"></i>
                                                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                        ${item.numberReimbursement}
                                                        <span class="visually-hidden"></span>
                                                    </span>
                                                </button>`;

                data.push({
                    'id': item.id,
                    'userName': item.storeUser.name,
                    'boxCloseReasonId': item.boxCloseReasonId,
                    'boxCloseReasonName': item.boxCloseReason.name,
                    'initialAmount': item.initialAmount,
                    'finalAmount': item.finalAmount,
                    'gain': item.gain,
                    'cashWithdrawal': btnCashWithdrawalDetail,
                    'cashIncome': btnCashIncomeDetail,
                    'startDate': getDateDDMMYYYYHHMMByDateTime(item.startDate),
                    'endDate': getDateDDMMYYYYHHMMByDateTime(item.endDate),
                    'action': `${btnCashIncome} ${btnCashWithdrawal} ${btnCloseCashRegister} ${btnProductReturnsDetail}`
                });
            });

            tableCashRegister.clear().draw();
            tableCashRegister.rows.add(data); // Add new data
            tableCashRegister.columns.adjust().draw(); // Redraw the DataTable
        }
        else {
            tableCashRegister.clear().draw();
        }
    });
}

const buildTableCashFlowsDetail = (cashFlowsDetail) => {

    $('#sectionCashFlowsDetail').html('');

    cashFlowsDetail.map((item) => {
        $('#sectionCashFlowsDetail').append(buildCardCashFlowDetail(item));
    });

    $('#modalCashFlowsDetail').modal('show');
}

const buildCardCashFlowDetail = (detail) => {
    return `
        <div class="card">
          <div class="card-body">
            <div class="row">
                <div class="col col-lg-2">${detail.boxCutId}</div>
                <div class="col col-lg-3">$${detail.quantity}.00</div>
                <div class="col col-lg-4">${detail.reason}</div>
                <div class="col col-lg-3">${getDateDDMMYYYYHHMMByDateTime(detail.createDate)}</div>
            </div>
          </div>
        </div>
    `;
}

const buildTableProductReturnsDetail = (products) => {

    let tableProductReturns = $('#tableProductReturns').DataTable();
    let data = new Array();

    products.map((item) => {

        data.push({
            'saleId': item.saleId,
            'product': `${item.name} ${item.description}`,
            'quantity': item.quantity,
            'unitMeasure': item.unitMeasure,
            'salePrice': item.retailPrice > 0 ? item.retailPrice : item.wholesalePrice,
            'gain': item.retailGain > 0 ? item.retailGain : item.wholesaleGain,
            'saleType': item.retailGain > 0 ? 'Menudeo' : 'Mayoreo',
            'revenue': item.revenue,
            'user': item.user,
            'saleDate': getDateDDMMYYYYHHMMByDateTime(item.saleDate),
            'userAppliesReturn': item.userAppliesReturn,
            'returnDate': getDateDDMMYYYYHHMMByDateTime(item.returnDate)
        });
    });

    tableProductReturns.clear().draw();
    tableProductReturns.rows.add(data); // Add new data
    tableProductReturns.columns.adjust().draw(); // Redraw the DataTable

    $('#modalProductReturnsDetail').modal('show');
}

const validateFormCashWithdrawal = (cashFlow, finalAmount) => {
    let res = true;

    if (cashFlow.quantity < 1) {
        dinamycTimerAlert({ title: '¡Monto requerido!', text: 'El monto de retiro debe ser mayor a 0.', type: 'error' });
        return res = false;
    }

    if (finalAmount < cashFlow.quantity) {
        dinamycTimerAlert({ title: '¡Monto excedido!', text: 'El monto de retiro no puede ser mayor al que existe en caja.', type: 'error' });
        return res = false;
    }

    if (cashFlow.reason == '' || cashFlow.reason.length < 10) {
        dinamycTimerAlert({ title: '¡Motivo requerido!', text: 'El motivo del retiro es requerido y la descripción debe ser valida.', type: 'error' });
        return res = false;
    }

    return res;
}

const validateFormCashIncome = (cashFlow) => {
    let res = true;

    if ($('#cashIncome').val() == '' || $('#cashIncome').val() < 1) {
        dinamycTimerAlert({ title: '¡Monto de ingreso requerido!', text: 'El monto de ingreso debe ser mayor a 0.', type: 'error' });
        return res = false;
    }

    if (cashFlow.reason == '' || cashFlow.reason.length < 10) {
        dinamycTimerAlert({ title: '¡Motivo requerido!', text: 'El motivo del ingreso es requerido y la descripción debe ser valida.', type: 'error' });
        return res = false;
    }

    return res;
}

const getDateDDMMYYYYHHMMByDateTime = (dateTime) => {
    dateTime = new Date(dateTime);

    //let UTCdate = new Date(dateTime + 'Z');

    //if (UTCdate.getFullYear() == 0)
    //    return '';

    if (dateTime.getFullYear().toString().length != 4)
        return '';

    let localDate = dateTime.toLocaleString().replace(',', '').split(' '); //UTCdate.toLocaleString().replace(',', '').split(' ');
    let date = localDate[0].split('/');
    let hours = localDate[1].split(':');

    let day = parseInt(date[0], 10);
    let month = parseInt(date[1], 10); + 1;
    let year = parseInt(date[2], 10);
    let hour = parseInt(hours[0], 10);
    let minutes = parseInt(hours[1], 10);

    let dformat = [day < 10 ? '0' + day : day, month < 10 ? '0' + month : month, year].join('/')
        + ' ' + [hour < 10 ? '0' + hour : hour, minutes < 10 ? '0' + minutes : minutes].join(':');

    return dformat;
}

const dinamicAlert = (settings) => {
    Swal.fire({
        title: settings.title,
        text: settings.text,
        icon: settings.type,
        showCancelButton: false,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Aceptar'
    })
}

const dinamycTimerAlert = (settings) => {
    Swal.fire({
        position: 'top-end',
        icon: settings.type,
        title: settings.title,
        text: settings.text,
        showConfirmButton: false,
        timer: 3000
    });
}

const printCashFlowTicket = (cashFlow) => {
    let text1 = 'retiro';
    let text2 = 'ingreso';
    const ticketInfo = JSON.parse(localStorage.getItem("ticketInfo"));
    const pathLogo = localStorage.getItem("pathLogo");

    let template = `

                    <div style="width: 300px; padding: 5px;">
                        <div style="text-align: center;">
                            <img src="~/images/Logo.png" width="70" height="30"><br>
                            <label style="font-size: x-large; font-weight: 600;">${ticketInfo.companyName}</label><br>
                            <label style="margin-top: 5px;">${ticketInfo.address}</label><br>
                            <div style="margin-top: 5px;">
                                <label>${getDateDDMMYYYYHHMM()}</label>
                            </div>
                            <div style="margin-top:5px;">
                                <label>*** Ticket por ${cashFlow.cashFlowsTypesId == 1 ? text1 : text2} de efectivo ***</label>
                            </div>
                        </div>
                        <hr>                        
                        <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                            <label>Motivo:</label>
                        </div>                        
                        <div style="text-align: center;">
                            <label>${cashFlow.reason}</label>
                        </div>
                        <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                            <label>Importe: $${cashFlow.quantity}.00 </label>
                        </div>
                        <hr>
                        <div style="text-align: center;">
                            <p>**************************************</p>
                            <p>${ticketInfo.footer}</p>
                        </div>
                    </div>`;

    newwin = window.open('');
    newwin.document.write(template);
    newwin.print();
    newwin.close();
}

const getDateDDMMYYYYHHMM = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    let hour = today.getHours();
    let minutes = today.getMinutes();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return `${dd}/${mm}/${yyyy} ${hour}:${minutes}`;
}

/* * *  Call API  * */

const getAllCashRegister = async () => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/CashRegister/GetAllCashRegister`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const getCashFlowsDetail = async (boxCutId, cashFlowsType) => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/CashRegister/GetCashFlowsDetail`);
    url.searchParams.set('boxCutId', boxCutId);
    url.searchParams.set('cashFlowsType', cashFlowsType);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const getProductReturnsDetail = async (boxCutId) => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/CashRegister/GetProductReturnsDetail`);
    url.searchParams.set('boxCutId', boxCutId);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const closeCashRegister = async (cashRegister) => {
    let data = '';
    const url = new URL(`${window.location.origin}/CashRegister/CloseCashRegister`);

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cashRegister)
    });

    data = await response.json();

    return data;
}

const applyCashFlows = async (cashFlow) => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/CashRegister/ApplyCashFlows`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cashFlow)
    });
    data = await response.json();

    return data;
}
$(() => {
    $('#tableProductsSold').DataTable({
        language: language,
        destroy: true,
        lengthChange: true,
        info: true,
        ordering: false,
        scrollX: true,
        scrollCollapse: true,
        paging: true,
        fixedColumns: {
            left: 3,
            right: 4
        },
        lengthMenu: [
            [5, 15, 40, -1],
            [5, 15, 40, 'Todos']
        ],
        columnDefs: [
            {
                target: 2,
                visible: false
            },
            {
                target: 12,
                visible: false
            },
            {
                target: 14,
                visible: false
            }
        ],
        columns: [
            { data: 'saleId' },//0
            { data: 'boxCutId' },//1
            { data: 'productId' },//2
            { data: 'product' },//3
            { data: 'quantity' },//4
            { data: 'purchasePrice', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//5
            { data: 'retailPrice', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//6
            { data: 'retailGain', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//7
            { data: 'wholesalePrice', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//8
            { data: 'wholesaleGain', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//9
            { data: 'wholesale' },//10
            { data: 'revenue', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//11
            { data: 'unitMeasureId' },//12
            { data: 'saleDate' },//13
            { data: 'userId' },//14
            { data: 'user' },//15
            { data: 'action' }//16
        ]
    });

    $('#loadingPage').fadeIn(1);

    $('#dateSaleStart').attr('max', getDateYYYYMMDD());
    $('#dateSaleEnd').attr('max', getDateYYYYMMDD());

    const filterSaleProducts = {
        userId: 0,
        saleDateStart: null,
        saleDateEnd: null
    };

    GetSalesByUserId(filterSaleProducts).then((res) => {

        if (res != null && res.length > 0)
            buildTableProductsSold(res);
        else
            $('#loadingPage').fadeOut(1);
    });
});

$('#btnFilterDate').on('click', (e) => {
    const filterSaleProducts = {
        userId: 0,
        saleDateStart: $('#dateSaleStart').val() != '' ? $('#dateSaleStart').val() : null,
        saleDateEnd: $('#dateSaleEnd').val() != '' ? $('#dateSaleEnd').val() : null
    };

    if (validateFilters(filterSaleProducts)) {

        $('#loadingPage').fadeIn(1);

        GetSalesByUserId(filterSaleProducts).then((res) => {

            if (res != null) {
                if (res.length == 0) {
                    $('#loadingPage').fadeOut(1);
                    dynamicAlert({ title: '', text: 'No hay informacion para los filtros seleccionados.', type: 'info' });
                }

                $('#dateSaleStart').val('');
                $('#dateSaleEnd').val('');
                buildTableProductsSold(res);
            }
            else {
                dynamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                $('#loadingPage').fadeOut(1);
            }
        });
    }
});

$(document).on('click', '.btnReturnProduct', (e) => {

    let btnReturnProduct = e.currentTarget;
    let dataProductReturnEncode = btnReturnProduct.getAttribute('data-product-return');
    let row = e.currentTarget.parentNode._DT_CellIndex.row;
    let nameProduct = $('#tableProductsSold').DataTable().cell(row, 3).data();
    let quantity = Math.round($('#tableProductsSold').DataTable().cell(row, 4).data() * 100) / 100;
    let retailPrice = Math.round($('#tableProductsSold').DataTable().cell(row, 6).data() * 100) / 100;
    let wholesale = Math.round($('#tableProductsSold').DataTable().cell(row, 10).data() * 100) / 100;
    let unitMeasureId = $('#tableProductsSold').DataTable().cell(row, 12).data();

    let quantityCmbx = document.getElementById('quantity');
    quantityCmbx.innerHTML = '';

    for (let i = 0; i < quantity; i++) {
        i = wholesale > 1 || unitMeasureId != 3 ? quantity : i;

        let option = document.createElement('option');
        option.value = wholesale > 1 || unitMeasureId != 3 ? quantity : i + 1;
        option.innerText = wholesale > 1 || unitMeasureId != 3 ? quantity : i + 1;

        if (i + 1 == quantity)
            option.selected = true;

        quantityCmbx.appendChild(option);
    }

    $('#nameProduct').val(nameProduct);
    $('#productReturns').attr('data-product-return-encode', dataProductReturnEncode);
    $('#refundAmount').val(btnReturnProduct.getAttribute('data-revenue'));
    $('#refundAmount').attr('data-retail-price', retailPrice);
    $('#modalReturnNote').modal('show');
});

$('#btnApplyReimbursement').on('click', (e) => {
    let productReturnseEncode = $('#productReturns').attr('data-product-return-encode');
    let dataProductReturnDecode = JSON.parse(decodeURIComponent(productReturnseEncode));
    let quantityCmbx = document.getElementById('quantity');

    let productReturns = {
        "id": 0,
        "saleId": dataProductReturnDecode.saleId,
        "boxCutId": dataProductReturnDecode.boxCutId,
        "productId": dataProductReturnDecode.productId,
        "userId": 0,
        "quantity": dataProductReturnDecode.wholesale = 1 ? quantityCmbx.value : dataProductReturnDecode.quantity,
        "purchasePrice": dataProductReturnDecode.purchasePrice,
        "retailPrice": dataProductReturnDecode.retailPrice,
        "retailGain": dataProductReturnDecode.retailGain,
        "wholesalePrice": dataProductReturnDecode.wholesalePrice,
        "wholesaleGain": dataProductReturnDecode.wholesaleGain,
        "wholesale": dataProductReturnDecode.wholesale,
        "revenue": dataProductReturnDecode.wholesale = 1 ? $('#refundAmount').val() : dataProductReturnDecode.revenue,
        "unitMeasureId": dataProductReturnDecode.unitMeasureId,
        "saleDate": null
    };

    const filterSaleProducts = {
        userId: 0,
        saleDateStart: null,
        saleDateEnd: null
    };

    ValidateBoxCutOpen(productReturns.revenue).then((res) => {

        if (res.boxOpen) {

            Swal.fire({
                title: `¿Estas seguro de realizar la devolución?`,
                text: `Los cambios no podran revertirse.`,
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

                    ReturnProduct(productReturns).then((res) => {

                        if (res != null && res > 0) {
                            printTicket(productReturns, $('#nameProduct').val());

                            GetSalesByUserId(filterSaleProducts).then((res) => {

                                if (res != null && res.length > 0) {
                                    buildTableProductsSold(res);
                                }
                                else {
                                    $('#tableProductsSold').DataTable().clear().draw();
                                    $('#loadingPage').fadeOut(1);
                                }
                            });

                            $('#modalReturnNote').modal('hide');
                            dynamicTimerAlert({ title: '¡Devolución exitosa!', text: 'Los productos fueron devueltos con éxito.', type: 'success' });
                        }
                        else {
                            dynamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                        }
                    });

                }
            });
        }
        else {
            $('#loadingPage').fadeOut(1);
            dynamicAlert({ title: `¡Caja registradora!`, text: `¡${res.statusMessage}!`, type: 'error' });
        }
    });
});

$('#dateSaleStart').on('change', (e) => {
    let dateSaleStart = e.currentTarget.value;

    $('#dateSaleEnd').attr('min', dateSaleStart);
});

$('#dateSaleEnd').on('change', (e) => {
    let dateSaleEnd = e.currentTarget.value;

    $('#dateSaleStart').attr('max', dateSaleEnd);
});

$('#quantity').on('change', (e) => {
    let retailPrice = Math.round($('#refundAmount').attr('data-retail-price') * 100) / 100;
    $('#refundAmount').val(e.currentTarget.value * retailPrice);
});

const buildTableProductsSold = (products) => {
    let tableSearchProducts = $('#tableProductsSold').DataTable();
    let data = new Array();

    products.map((item) => {

        data.push({
            'saleId': item.saleId,
            'boxCutId': item.boxCutId,
            'productId': item.productId,
            'product': `${item.name} ${item.description}`,
            'quantity': item.quantity,
            'purchasePrice': item.purchasePrice,
            'retailPrice': item.retailPrice,
            'retailGain': item.retailGain,
            'wholesalePrice': item.wholesalePrice,
            'wholesaleGain': item.wholesaleGain,
            'wholesale': item.wholesale,
            'revenue': item.revenue,
            'unitMeasureId': item.unitMeasureId,
            'saleDate': new Date(item.saleDate).toLocaleDateString(),
            'userId': item.userId,
            'user': item.user,
            'action': `<button type="button" 
                               class="btn btn-danger text-white btnReturnProduct"
                               data-toggle="tooltip" data-placement="top" title="Devolucion"
                               data-revenue="${item.revenue}"
                               data-product-return="${encodeURIComponent(JSON.stringify(ppp = {
                id: 0,
                saleId: item.saleId,
                boxCutId: item.boxCutId,
                productId: item.productId,
                userId: item.userId,
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                retailPrice: item.retailPrice,
                retailGain: item.retailGain,
                wholesalePrice: item.wholesalePrice,
                wholesaleGain: item.wholesaleGain,
                wholesale: item.wholesale,
                revenue: item.revenue,
                unitMeasureId: item.unitMeasureId,
                saleDate: null
            }))}">
                        <i class="fa-solid fa-box"></i>
                        <i class="fa-solid fa-rotate-left"></i>
                      </button>`
        });
    });

    tableSearchProducts.clear().draw();
    tableSearchProducts.rows.add(data); // Add new data
    tableSearchProducts.columns.adjust().draw(); // Redraw the DataTable
    $('#loadingPage').fadeOut(1);
}

const validateFilters = (filters) => {

    if (filters.saleDateStart != null && filters.saleDateEnd != null) {

        if (filters.saleDateStart > filters.saleDateEnd) {
            dynamicTimerAlert({ title: '¡Fecha inicio!', text: 'La fecha inicio no puede ser mayor a la fecha fin.', type: 'error' });
            return false;
        }

        if (filters.saleDateEnd < filters.saleDateStart) {
            dynamicTimerAlert({ title: '¡Fecha fin!', text: 'La fecha fin no puede ser menor a la fecha inicio.', type: 'error' });
            return false;
        }
    }

    if (filters.saleDateStart == null && filters.saleDateEnd != null) {
        dynamicTimerAlert({ title: '¡Fecha inicio!', text: 'La fecha inicio es requerida.', type: 'error' });
        return false;
    }

    if (filters.saleDateEnd == null && filters.saleDateStart != null) {
        dynamicTimerAlert({ title: '¡Fecha fin!', text: 'La fecha fin es requerida.', type: 'error' });
        return false;
    }

    return true;
}

const printTicket = (productReturns, nameProduct) => {
    const ticketInfo = JSON.parse(localStorage.getItem("ticketInfo"));
    const pathLogo = localStorage.getItem("pathLogo");

    let template = `
                                <div style="width: 300px; padding: 5px;">
                                    <div style="text-align: center;">
                                        <img src="~${pathLogo}" width="70" height="30"><br>
                                        <label style="font-size: x-large; font-weight: 600;">${ticketInfo.companyName}</label></br>
                                        <label style="margin-top: 5px;">${ticketInfo.address}</label><br>
                                        <label style="margin-top: 5px;">${getDateDDMMYYYYHHMM()}</label><br>
                                        <label>*** Ticket por devolución ***</label>
                                    </div>
                                    <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                                        <label>Cantidad</label>
                                        <label>P. Unitario</label>
                                        <label>Importe</label>
                                    </div>
                                    <hr>
                                        ${getProductsToPrint(productReturns, nameProduct)}            
                                    <hr>
                                    <div style="text-align: center;">
                                        <p>**************************************</p>
                                        <p>${ticketInfo.footer}</p>
                                    </div>
                                </div>
                                 `;

    newwin = window.open('');
    newwin.document.write(template);
    newwin.print();
    newwin.close();
}

const getProductsToPrint = (productReturns, nameProduct) => {
    let textHtml = '';

    textHtml += `
                    <div style="margin-right: 5px;">
                          <label>${nameProduct}</label>
                    </div>
                    <div style="display: flex; justify-content: space-around">
                         <div>
                             <label>${productReturns.quantity}</label>
                         </div>
                         <div>
                             <label>$${productReturns.retailPrice > 0 ? productReturns.retailPrice : productReturns.wholesalePrice}</label>
                         </div>
                         <div>
                             <label>$${productReturns.revenue}</label>
                         </div>
                     </div>
                    `;
    return textHtml;
}

const dynamicAlert = (settings) => {
    Swal.fire({
        title: settings.title,
        text: settings.text,
        icon: settings.type,
        showCancelButton: false,
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Aceptar'
    })
}

const dynamicTimerAlert = (settings) => {
    Swal.fire({
        position: 'top-end',
        icon: settings.type,
        title: settings.title,
        text: settings.text,
        showConfirmButton: false,
        timer: 2000
    });
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
    if (hour < 10) hour = '0' + hour;
    if (minutes < 10) minutes = '0' + minutes;

    return `${dd}/${mm}/${yyyy} ${hour}:${minutes}`;
}

const getDateYYYYMMDD = () => {
    const today = new Date().toLocaleDateString().split('/');
    const yyyy = today[2];
    let mm = today[1] < 10 ? `0${today[1]}` : today[1];
    let dd = today[0] < 10 ? `0${today[0]}` : today[0];

    return `${yyyy}-${mm}-${dd}`;
}

/* * *  Call API  * */

const GetSalesByUserId = async (filterSaleProducts) => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/Sale/GetSalesByUserId`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filterSaleProducts)
    });
    data = await response.json();

    return data;
}

const ReturnProduct = async (reimbursement) => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/Sale/ReturnProduct`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reimbursement)
    });
    data = await response.json();

    return data;
}

const ValidateBoxCutOpen = async (change) => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/CashRegister/ValidateBoxCutOpen`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(change)
    });
    data = await response.json();

    return data;
}
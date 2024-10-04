$(() => {
    document.getElementById('wholesaleApply').classList.add('visually-hidden');

    $('#loadingPage').fadeIn(1);

    $('#tableSellProducts').DataTable({
        'language': language,
        'destroy': true,
        'lengthChange': false,
        "paging": false,
        "ordering": false,
        "searching": false,
        "info": false,
        scrollX: true,
        scrollCollapse: true,
        fixedColumns: {
            left: 1,
            right: 1
        },
        columnDefs: [
            { target: 2, visible: false },
            { target: 3, visible: false },
            { target: 4, visible: false },
            { target: 5, visible: false },
            { target: 6, visible: false },
            { target: 7, visible: false },
            { target: 8, visible: false },
            { target: 9, visible: false },
            { target: 10, visible: false },
            { target: 11, visible: false },
            { target: 12, visible: false },
            { target: 13, visible: false },
            { target: 19, visible: false },
            { className: 'dt-center', targets: '_all' },
        ],
        columns: [
            //Datos producto
            { data: 'barCode' },//0
            { data: 'name' },//1
            { data: 'expirationDate' },//2
            { data: 'stock' },//3
            { data: 'minimumStock' },//4
            { data: 'purchasePrice', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//5
            { data: 'salesPrice1', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//6
            { data: 'percentageProfit1', render: $.fn.dataTable.render.number(',', '.', 2, '', '%') },//7
            { data: 'revenue1', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//8
            { data: 'salesPrice2', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//9
            { data: 'percentageProfit2', render: $.fn.dataTable.render.number(',', '.', 2, '', '%') },//10
            { data: 'revenue2', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//11
            { data: 'wholesale' },//12
            { data: 'departmentName' },//13
            //Datos venta
            { data: 'quantity' },//14
            { data: 'measurementUnit' },//15
            { data: 'salesPrice', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//16
            { data: 'amount', render: $.fn.dataTable.render.number(',', '.', 2, '$') },//17
            { data: 'action' },//18
            { data: 'productId' }//19
        ]
    });

    $('#tableSearchProducts').DataTable({
        language: language,
        destroy: true,
        lengthChange: false,
        scrollX: true,
        scrollY: '230px',
        scrollCollapse: true,
        fixedColumns: {
            left: 1,
            right: 1
        },
        columnDefs: [
            {
                target: 1,
                visible: false
            }
        ],
        columns: [
            { data: 'barCode' },
            { data: 'productId' },
            { data: 'name' },
            { data: 'expirationDate' },
            { data: 'stock' },
            { data: 'salesPrice1', render: $.fn.dataTable.render.number(',', '.', 2, '$') },
            { data: 'salesPrice2', render: $.fn.dataTable.render.number(',', '.', 2, '$') },
            { data: 'wholesale' },
        ]
    });

    $(document).on('shown.bs.modal', '#modalProducts', function () {
        $($.fn.dataTable.tables(true)).DataTable()
            .columns.adjust()
            .responsive.recalc();
    });

    validateOpenCashRegister().then((res) => {

        $('#loadingPage').fadeOut(1);

        if (res != null) {

            if (res === true) {
                Swal.fire({
                    title: '¡Cerrar caja abierta!',
                    text: "Hay una caja abierta que no se cerro. ¡Cerrar caja para poder continuar vendiendo.!",
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Aceptar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location = window.location.origin + '/Home';
                    }
                })
            }

            if (res === false) {
                $('#modalStartCashRegister').modal('show');
            }
        }
        else {
            dinamicAlert({
                title: '¡Ocurrio un error!',
                text: 'Recargue la pagína e intente nuevamente.',
                type: 'error'
            });
        }
    });
});

$('#btnSearchProduct').on('click', (e) => {
    $('#txtNameDescriptionProduct').val('');
    $('#tableSearchProducts').DataTable().clear().draw();
    $('#modalProducts').modal('show');
});

$('#btnSearchProductByNameDescription').on('click', (e) => {
    let keyWord = document.getElementById('txtNameDescriptionProduct').value;

    if (keyWord != '' && keyWord.length >= 3) {

        $('#loadingPage').fadeIn(1);

        getProductByNameOrDescription(keyWord.trim()).then((productModel) => {

            if (productModel != null && productModel.products.length > 0) {
                buildTableProducts(productModel.products);
                document.getElementById('btnAddProductToSale').disabled = true;
                $('#modalProducts').modal('show');
            }
            else {
                $('#loadingPage').fadeOut(1);
                dinamicAlert({
                    title: '¡No se encontraron coincidencias!',
                    text: 'Intente con otro producto.',
                    type: 'warning'
                });
            }
        });
    }
    else {
        dinamicAlert({
            title: '¡Palabra clave requerida!',
            text: 'Es necesario ingresar una palabra clave para poder realizar la busqueda.',
            type: 'error'
        });
    }
});

$('#btnAddProduct').on('click', (e) => {
    let txtBarCode = document.getElementById('txtBarCode').value;

    if (txtBarCode != '') {

        SearchProductByBarCode(txtBarCode).then((products) => {

            document.getElementById('txtBarCode').value = '';

            if (products != null && products.length == 1) {
                buildTableSellProducts(products[0]);
            }
            else if (products != null && products.length > 1) {

                buildTableProducts(products);
                dinamicAlert({
                    title: '',
                    text: 'El codigo buscado esta asignado a productos diferentes, seleccione uno de la lista.',
                    type: 'info'
                });
                $('#modalProducts').modal('show');
            }
            else {
                dinamicAlert({
                    title: '¡Producto no encontrado!',
                    text: '',
                    type: 'warning'
                });
            }
        });
    }
    else {
        dinamicAlert({
            title: '¡Codigo requerido!',
            text: 'Ingresar el codigo que desea buscar',
            type: 'warning'
        });
    }
});

$('#btnChargeProducts').on('click', (e) => {
    let total = $('#wholePurchase').val() != '' ? Math.round($('#wholePurchase').val() * 100) / 100 : 0;

    if (total > 0) {
        document.getElementById('txtAmountPayable').value = total;
        document.getElementById('txtCash').value = '';
        document.getElementById('txtMoneyChange').value = '';
        $('#modalPayProducts').modal('show');
    }
    else {
        dinamicAlert({
            title: '¡Productos requeridos!',
            text: 'Agrega al menos un producto a la venta para poder cobrar.',
            type: 'info'
        });
    }
});

$('#txtCash').on('input', (e) => {

    //let cash = Math.round(e.currentTarget.value, 10);
    //let amountPayable = Math.round($('#txtAmountPayable').val(), 10);

    //$('#txtMoneyChange').val(cash - amountPayable);

    //if (cash >= amountPayable) {
    //    $('#btnPayProductos').attr('disabled', false);

    //    if (e.which === 13)
    //        $('#btnPayProductos').trigger('click');
    //}
    //else
    //    $('#btnPayProductos').attr('disabled', true);

    let cash = parseFloat(e.currentTarget.value);
    let amountPayable = parseFloat($('#txtAmountPayable').val());

    if (!isNaN(cash) && cash >= amountPayable) {
        // Redondear al decimal más cercano
        cash = Math.round(cash * 10) / 10;

        $('#txtCash').val(cash);  // Actualizar el valor en el campo

        $('#txtMoneyChange').val(Math.round((cash - amountPayable) * 10) / 10);

        if (cash >= amountPayable) {
            $('#btnPayProductos').attr('disabled', false);

            if (e.which === 13) {
                $('#btnPayProductos').trigger('click');
            }
        } else {
            $('#btnPayProductos').attr('disabled', true);
        }
    }
    else {
        $('#txtMoneyChange').val('');
        $('#btnPayProductos').attr('disabled', true);
    }
});

$('#btnPayProductos').on('click', (e) => {
    $('#loadingPage').fadeIn(1);
    let cash = $('#txtCash').val() != '' ? Math.round($('#txtCash').val() * 100) / 100 : 0;
    let amountPayable = $('#txtAmountPayable').val() != '' ? Math.round($('#txtAmountPayable').val() * 100) / 100 : 0;
    let moneyChange = $('#txtMoneyChange').val() != '' ? Math.round($('#txtMoneyChange').val() * 100) / 100 : 0;

    ValidateBoxCutOpen(moneyChange).then((res) => {

        if (res.boxOpen) {
            payProducts(cash, moneyChange);
        }
        else {
            $('#loadingPage').fadeOut(1);

            Swal.fire({
                title: `¿Deseas continuar la venta?`,
                text: `¡${res.statusMessage}!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    payProducts(cash, moneyChange);
                }
            });
        }
    });
});

$('#tableSellProducts tbody').on('click', '[id*=btnDropProduct]', function (e) {
    let tableSellProducts = $('#tableSellProducts').DataTable();
    tableSellProducts.row($(this).parents('tr')).remove().draw();
    calculateTotal();
});

$('#tableSellProducts tbody').on('change', '[id*=inputStock]', function (e) {
    let row = e.currentTarget.parentNode._DT_CellIndex.row;
    let stockRequired = e.currentTarget.value;
    let actuallyStock = Math.round($('#tableSellProducts').DataTable().cell(row, 3).data() * 100) / 100;
    let measurementUnit = $('#tableSellProducts').DataTable().cell(row, 15).data();

    if (stockRequired == '' || stockRequired == 0) {
        stockRequired = 1;
        e.currentTarget.value = 1;
    }

    stockRequired = Math.round(stockRequired * 100) / 100;

    if (measurementUnit.includes('PZA') && stockRequired < 1) { //validamos que las unidades por pieza se vendan por KG o Metro
        e.currentTarget.value = 1;
        stockRequired = 1;
    }

    if (stockRequired > actuallyStock) { //Validamos que halla stock suficiente para poder venderlo
        e.currentTarget.value = actuallyStock;
        stockRequired = actuallyStock;

        dinamicAlert({
            title: '¡Existencias insuficientes!',
            text: `Para este producto solo quedan ${actuallyStock}`,
            type: 'warning'
        });
    }
    calculateAmount(row, stockRequired);
    calculateTotal();
});

$('#tableSearchProducts tbody').on('click', 'tr', function (e) {
    if ($(this).hasClass('row_selected')) {
        $(this).removeClass('row_selected');
        document.getElementById('btnAddProductToSale').disabled = true;

    }
    else {
        $('#tableSearchProducts').DataTable().$('tr.row_selected').removeClass('row_selected');
        $(this).addClass('row_selected');
        document.getElementById('btnAddProductToSale').disabled = false;
    }
});

$('#btnClearSell').on('click', (e) => {
    $('#tableSellProducts').DataTable().clear().draw();
    $('#wholePurchase').val('');
});

$('#btnAddProductToSale').on('click', (e) => {
    let tableSearchProducts = $('#tableSearchProducts').DataTable();

    if (tableSearchProducts.rows('.row_selected')[0].length > 0) {
        let productId = tableSearchProducts.rows('.row_selected').data()[0].productId;

        getProductById(productId).then((res) => {
            if (res != null) {
                buildTableSellProducts(res);
                $('#modalProducts').modal('hide');

            }
            else {
                dinamicAlert({
                    title: '¡Ocurrio un error!',
                    text: 'Recargue la pagína e intente nuevamente.',
                    type: 'error'
                });
            }
        });
    }
});

$('#btnCancelSale').on('click', (e) => {
    Swal.fire({
        title: '¿Seguro de cancelar la venta?',
        text: "Si cancelas la venta no se podran revertir los cambios.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            window.location = window.location.origin + '/Home/index';
        }
    });
});

$('#btnStartCashRegister').on('click', (e) => {
    let initialAmount = $('#initialAmount').val();

    if (initialAmount != '' && initialAmount > 0) {
        openCashRegister(initialAmount).then((res) => {
            if (res > 0) {
                $('#modalStartCashRegister').modal('hide');
                dinamycTimerAlert({
                    title: '¡Caja iniciada!',
                    text: 'La caja fue abierta con exito.',
                    type: 'success'
                });
            }
            else {
                dinamicAlert({
                    title: '¡Ocurrio un error!',
                    text: 'Recargue la pagína e intente nuevamente.',
                    type: 'error'
                });
            }
        });
    }
    else {
        dinamicAlert({
            title: '¡Monto inicial requerido!',
            text: 'Recuerda que para iniciar el turno es necesario indicar el monto inicial.',
            type: 'warning'
        });
    }
});

$('#initialAmount').on('keypress', (e) => {
    if (e.which === 13)
        $('#btnStartCashRegister').trigger('click');
});

//$('body').delegate('#txtBarCode', 'keypress', (e) => {
//    if (e.which === 13 && e.currentTarget.value != '')
//        $('#btnAddProduct').trigger('click');
//});

$('#txtNameDescriptionProduct').on('keypress', (e) => {
    if (e.which === 13 && e.currentTarget.value != '')
        $('#btnSearchProductByNameDescription').trigger('click');
});

//$('#txtBarCode').on('change', (e) => { $('#btnAddProduct').trigger('click'); });

$('#txtBarCode').on('keyup', (e) => {
    if (e.which === 13) {
        $('#btnAddProduct').trigger('click');
    }
});

const buildTableSellProducts = (product) => {
    let tableSellProducts = $('#tableSellProducts').DataTable();
    let productsOnSale = new Array();
    let data = new Array();

    productsOnSale = $('#tableSellProducts').DataTable().data().toArray();

    let row = -1;

    //Validamos que el producto no exista en el ticket de venta
    if (product.barCode != '')
        row = productsOnSale.findIndex(i => i.barCode == product.barCode && i.name.trim() == `${product.name.trim()} ${product.description.trim()}`);
    else
        row = productsOnSale.findIndex(i => i.name.trim() == `${product.name.trim()} ${product.description.trim()}`);

    //Actualizamos las existencias del producto que ya existe en la venta
    if (row >= 0) {
        let inputStock = $(tableSellProducts.cell(row, 14).node()).find('input');

        let actuallyStock = inputStock[0].value != '' ? Math.round(inputStock[0].value * 100) / 100 : 0;

        actuallyStock += 1;

        tableSellProducts.cell(row, 14).data(`<input class="form-control" type="number" min="0" value ="${actuallyStock}" id="inputStock"/>`).draw();
        calculateAmount(row, actuallyStock);
    }
    //Agregamos el producto a la venta
    else {
        let inputStock = `<input class="form-control" type="number" min="0" value ="${product.stock < 1 ? product.stock : 1}" id="inputStock"/>`;

        let iconDelete = document.createElement('i');
        iconDelete.classList.add('fa-solid', 'fa-xmark', 'pointer');
        iconDelete.setAttribute('id', 'btnDropProduct')

        data.push({
            'barCode': product.barCode,
            'name': product.name + ' ' + product.description,
            //'expirationDate': product.expirationDate != null ? new Date(product.expirationDate).toLocaleDateString() : '', se usa solo en produccion UTC
            'expirationDate': product.expirationDate != null ? new Date(product.expirationDate) : '',
            'stock': product.stock,
            'minimumStock': product.minimumStock,
            'purchasePrice': product.purchasePrice,
            'salesPrice1': product.priceProducts[0].salesPrice,
            'percentageProfit1': product.priceProducts[0].percentageProfit,
            'revenue1': product.priceProducts[0].revenue,
            'salesPrice2': product.priceProducts.length > 1 ? product.priceProducts[1].salesPrice : '',
            'percentageProfit2': product.priceProducts.length > 1 ? product.priceProducts[1].percentageProfit : '',
            'revenue2': product.priceProducts.length > 1 ? product.priceProducts[1].revenue : '',
            'wholesale': product.priceProducts.length > 1 ? product.priceProducts[1].wholesale : '',
            'departmentName': product.department.name,
            'quantity': inputStock,
            'measurementUnit': product.measurementUnit.icon,
            'salesPrice': product.priceProducts[0].salesPrice,
            'amount': (product.stock < 1 ? product.stock : 1) * product.priceProducts[0].salesPrice,
            'action': `${iconDelete.outerHTML}`,
            'productId': product.id,
        });
        tableSellProducts.rows.add(data).draw(false); // Add new data.
    }

    calculateTotal();
}

const buildTableProducts = (products) => {
    let tableSearchProducts = $('#tableSearchProducts').DataTable();
    let productsInCart = $('#tableSellProducts').DataTable().data().toArray();
    let data = new Array();

    products = products.filter(({ stock }) => stock > 0);

    products.map((item) => {
        let stock = item.stock;

        if (productsInCart.length > 0) {
            let res;

            if (item.productId == undefined)
                res = productsInCart.findIndex(i => i.productId == item.id);
            else
                res = productsInCart.findIndex(i => i.productId == item.productId);

            if (res != -1) {
                let quantity = $($('#tableSellProducts').DataTable().cell(res, 14).node()).find('input')[0].value;
                stock = item.stock - quantity;
            }
        }

        if (stock > 0) {
            if (item.productId == undefined) {
                data.push({
                    'barCode': item.barCode,
                    'productId': item.id,
                    'name': `${item.name} ${item.description}`,
                    'expirationDate': item.expirationDate != null ? new Date(item.expirationDate).toLocaleDateString() : '',
                    'stock': stock,
                    'salesPrice1': item.priceProducts[0].salesPrice,
                    'salesPrice2': item.priceProducts.length > 1 ? item.priceProducts[1].salesPrice : '',
                    'wholesale': item.priceProducts.length > 1 ? `${item.priceProducts[1].wholesale} ${item.measurementUnit.icon}` : ''
                });
            }
            else {
                data.push({
                    'barCode': item.barCode,
                    'productId': item.productId,
                    'name': `${item.nameProduct} ${item.description}`,
                    'expirationDate': item.expirationDate != null ? new Date(item.expirationDate).toLocaleDateString() : '',
                    'stock': stock,
                    'salesPrice1': item.salesPrice1,
                    'salesPrice2': item.salesPrice2 > 0 ? item.salesPrice2 : '',
                    'wholesale': item.wholesale2 > 0 ? `${item.wholesale2} ${item.icon}` : ''
                });
            }

        }
    });


    tableSearchProducts.clear().draw();
    tableSearchProducts.rows.add(data); // Add new data
    tableSearchProducts.columns.adjust().draw(); // Redraw the DataTable
    $('#loadingPage').fadeOut(1);
}

const calculateTotal = () => {
    let prices = $('#tableSellProducts').DataTable().rows().columns(17).data().toArray();
    let total = prices[0].reduce((a, b) => a + b, 0);
    $('#wholePurchase').val(Math.round(total * 100) / 100);
}

const calculateAmount = (row, stock) => {
    let tableSellProducts = $('#tableSellProducts').DataTable();
    let wholesale = tableSellProducts.cell(row, 12).data();

    //Validamos si aplica la venta por mayoreo
    if (isWholesale(stock, wholesale, row)) {

        //console.log('aplica mayoreo');

        let wholesalePrice = tableSellProducts.cell(row, 9).data(); //Precio de mayoreo

        tableSellProducts.cell(row, 16).data(wholesalePrice).draw(); // Precio de venta mostrado en pantalla
        tableSellProducts.cell(row, 17).data(stock * wholesalePrice).draw();// Importe = cantidad * precio de venta

    }
    else {
        //console.log('No aplica mayoreo');

        let salesPrice = tableSellProducts.cell(row, 6).data(); //Precio de menudeo

        tableSellProducts.cell(row, 16).data(salesPrice).draw(); // Precio de venta mostrado en pantalla
        tableSellProducts.cell(row, 17).data(stock * salesPrice).draw();// Importe = cantidad * precio de venta
    }
}

const payProducts = async (cash, moneyChange) => {

    try {
        let sellerItemsTypes = new Array();
        let printProducts = new Array();
        let tableSellProducts = $('#tableSellProducts').DataTable();
        let products = $('#tableSellProducts').DataTable().data().toArray();

        for (let i = 0; i < products.length; i++) {

            let quantity = $(tableSellProducts.cell(i, 14).node()).find('input')[0].value;
            let wholesaleActive = isWholesale(quantity, products[i].wholesale, i);

            sellerItemsTypes.push({
                'boxCutId': 0,
                'productId': products[i].productId,
                'userId': 0,
                'quantity': Math.round(quantity * 100) / 100,
                'purchasePrice': Math.round(products[i].purchasePrice * 100) / 100,
                'retailPrice': wholesaleActive ? 0 : Math.round(products[i].salesPrice1 * 100) / 100,
                'retailGain': wholesaleActive ? 0 : Math.round(products[i].revenue1 * 100) / 100,
                'wholesalePrice': wholesaleActive ? Math.round(products[i].salesPrice2 * 100) / 100 : 0,
                'wholesaleGain': wholesaleActive ? Math.round(products[i].revenue2 * 100) / 100 : 0,
                'wholesale': wholesaleActive ? Math.round(products[i].wholesale * 100) / 100 : 1,
                'amount': Math.round(products[i].amount * 100) / 100,
                'unitMeasureId': 0
            });

            printProducts.push({
                'name': products[i].name,
                'quantity': Math.round(quantity * 100) / 100,
                'salePrice': Math.round($('#tableSellProducts').DataTable().cell(i, 16).data() * 100) / 100,
                'amount': Math.round(products[i].amount * 100) / 100
            });
        }

        SellItems(sellerItemsTypes).then((saleId) => {

            if (saleId > 0) {
                const ticketInfo = JSON.parse(localStorage.getItem("ticketInfo"));
                const pathLogo = localStorage.getItem("pathLogo");

                let total = $('#wholePurchase').val();

                let template = `
                                    <div style="width: 300px; padding: 5px;">
                                        <div style="text-align: center;">
                                            <img src="~${pathLogo}" width="70" height="30"><br>
                                            <label style="font-size: x-large; font-weight: 600;">${ticketInfo.companyName}</label></br>
                                            <label style="margin-top: 5px;">${ticketInfo.address}</label><br>
                                            <label style="margin-top: 5px;">${getDateDDMMYYYYHHMM()}</label><br>
                                            <label>**************************************</label>
                                        </div>
                                        <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                                            <label>Cantidad</label>
                                            <label>P. Unitario</label>
                                            <label>Importe</label>
                                        </div>
                                        <hr>            
                                           ${getProductsToPrint(printProducts)}            
                                        <hr>
                                        <div style="text-align: center;">
                                            <h5>Total: $${total}</h5>
                                            <h5>Paga: $${cash}</h5>
                                            <h5>Su cambio: $${moneyChange}</h5>
                                        </div>
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

                $('#modalPayProducts').modal('hide');
                $('#btnClearSell').trigger('click');
                $('#loadingPage').fadeOut(1);

                dinamycTimerAlert({
                    title: '¡Pago exitoso!',
                    text: 'La venta fue realizada correctamente.',
                    type: 'success'
                });
            }
            else {
                $('#loadingPage').fadeOut(1);
                dinamicAlert({
                    title: '¡Ocurrio un error!',
                    text: 'Recargue la pagína e intente nuevamente.',
                    type: 'error'
                });
            }
        });
    }
    catch (e) {
        $('#loadingPage').fadeOut(1);
        dinamicAlert({
            title: '¡Ocurrio un error!',
            text: 'Recargue la pagína e intente nuevamente.',
            type: 'error'
        });
    }

}

const isWholesale = (stock, wholesale, row) => {
    let isWholesale = $('#tableSellProducts').DataTable().cell(row, 12).data() > 1 ? true : false;

    if (isWholesale && stock >= wholesale)
        return true;
    else
        return false;

}

const getProductsToPrint = (products) => {
    let textHtml = '';

    products.map((item) => {
        textHtml += `
                    <div style="margin-right: 5px;">
                          <label>${item.name}</label>
                    </div>
                    <div style="display: flex; justify-content: space-around">
                         <div>
                             <label>${item.quantity}</label>
                         </div>
                         <div>
                             <label>$${item.salePrice}</label>
                         </div>
                         <div>
                             <label>$${item.amount}</label>
                         </div>
                     </div>
                    `;
    });
    return textHtml;
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

/* * *  Call API  * */

const SearchProductByBarCode = async (barCode) => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/Product/GetProductByBarCode`);
    url.searchParams.set('barCode', barCode);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    data = await response.json();

    return data;
}

const getProductByNameOrDescription = async (keyWord) => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/Product/GetProductByNameOrDescription`);
    url.searchParams.set('keyWord', keyWord);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const getProductById = async (productId) => {
    let data = '';
    const url = new URL(`${window.location.origin}/Product/GetProductById`);
    url.searchParams.set('productId', productId);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const validateOpenCashRegister = async () => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/CashRegister/ValidateOpenCashRegister`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const openCashRegister = async (mount) => {
    let data = '';
    const url = new URL(`${window.location.origin}/CashRegister/OpenCashRegister`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mount)
    });

    data = await response.json();

    return data;
}

const SellItems = async (sellerItemsTypes) => {
    let data = '';
    const url = new URL(`${window.location.origin}/Sell/SellItems`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sellerItemsTypes)
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
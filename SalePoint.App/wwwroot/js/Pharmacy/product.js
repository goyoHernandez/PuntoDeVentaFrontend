$(() => {
    $('#expirationDate').attr('min', getDateYYYYMMDD());
    $('#loadingPage').fadeIn(1);
    getProducts('', 1, 100);
});

document.getElementById('btnSaveProduct').addEventListener('click', (e) => {

    let pageNumber = $('#pageNumber').val() == '' || $('#pageNumber').val() < 0 ? 1 : $('#pageNumber').val();
    let applyWholesale = document.getElementById('applyWholesale').checked;

    let product = {
        "id": $('#productId').val() > 0 ? parseInt($('#productId').val()) : 0,
        "name": $('#nameProduct').val(),
        "barCode": $('#barCode').val(),
        "expirationDate": $('#expirationDate').val() == '' ? null : $('#expirationDate').val().split("/").reverse().join("-"),
        "description": $('#description').val(),
        "stock": Math.round($('#stock').val() * 100) / 100,
        "minimumStock": Math.round($('#minimumStock').val() * 100) / 100,
        "purchasePrice": Math.round($('#purchasePrice').val() * 100) / 100,
        "thumbnail": null,
        "unitMeasureId": parseInt($('#measurementUnit').val()),
        "isActive": true,
        "creationDate": null,
        "modificationDate": null,
        "deletionDate": null,
        "userId": 0,
        "department": {
            "id": parseInt($('#department').val()),
            "name": null,
            "isActive": true,
            "creationDate": null,
            "modificationDate": null,
            "deletionDate": null
        },
        "productDepartment": {
            "id": 0,
            "productId": 0,
            "departmentId": 0
        },
        "measurementUnit": {
            "id": parseInt($('#measurementUnit').val()),
            "name": null,
            "icon": null,
            "creationDate": null,
            "modificationDate": null,
            "deletionDate": null,
            "isActive": true
        },
        "priceProducts": [
            {
                "id": 0,
                "productId": $('#productId').val() > 0 ? parseInt($('#productId').val()) : 0,
                "salesPrice": $('#salesPrice1').val() > 0 ? Math.round($('#salesPrice1').val() * 100) / 100 : 0,
                "percentageProfit": $('#percentageProfit1').val() > 0 ? Math.round($('#percentageProfit1').val() * 100) / 100 : 0,
                "revenue": $('#revenue1').val() > 0 ? Math.round($('#revenue1').val() * 100) / 100 : 0,
                "wholesale": 1
            }
        ]
    };

    if (applyWholesale) {
        product.priceProducts.push(
            {
                "id": 0,
                "productId": $('#productId').val() > 0 ? parseInt($('#productId').val()) : 0,
                "salesPrice": $('#salesPrice2').val() > 0 ? Math.round($('#salesPrice2').val() * 100) / 100 : 0,
                "percentageProfit": $('#percentageProfit2').val() > 0 ? Math.round($('#percentageProfit2').val() * 100) / 100 : 0,
                "revenue": $('#revenue2').val() > 0 ? Math.round($('#revenue2').val() * 100) / 100 : 0,
                "wholesale": $('#wholesale2').val() > 0 ? Math.round($('#wholesale2').val() * 100) / 100 : 0
            });
    }

    if (validateFormSaveProduct()) {
        $('#loadingPage').fadeIn(1);

        if (product.id == 0) {

            createProduct(product).then((productId) => {
                if (productId != null && productId > 0) {
                    getProducts('', 1, 100);
                    $('#btnCloseProductModal').trigger('click');
                    dinamycTimerAlert({ title: '¡Creado correctamente!', text: 'El producto fue creado', type: 'success' });
                }
                else {
                    $('#loadingPage').fadeOut(1);
                    dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                    $('#productModal').modal('show');
                }
            });
        }
        else {

            updateProduct(product).then((productId) => {
                if (productId != null && productId > 0) {
                    getProducts('', pageNumber, 100);
                    $('#btnCloseProductModal').trigger('click');
                    dinamycTimerAlert({ title: '¡Actualizado correctamente!', text: 'El producto fue actualizado', type: 'success' });
                }
                else {
                    $('#loadingPage').fadeOut(1);
                    dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                    $('#productModal').modal('show');
                }
            });
        }
    }
});

document.getElementById('btnCloseProductModal').addEventListener('click', (e) => {
    $('#productModal').modal('hide');
    $('.btnUpdateProduct').attr('disabled', false);
});

$('#minimumStock').on('focusout', (e) => {
    let stock = $('#stock').val() == '' ? 0 : parseInt($('#stock').val());
    let minimumStock = e.currentTarget.value == '' ? 0 : parseInt(e.currentTarget.value);

    if (stock < minimumStock) {
        Swal.fire({
            position: 'top-end',
            icon: 'info',
            title: '¡Atención!',
            text: 'La existencia minima no puede ser mayor a las existencias',
            showConfirmButton: false,
            timer: 3000
        });
        e.currentTarget.focus();
    }
});

$('#btnCreateProduct').on('click', (e) => {
    //$('#barCode').attr('disabled', false);
    $('#titleProductModal').text('Crear producto');
    clearFormSaveProduct();
    buildSelectDepartments(0);
    buildSelectMeasurementUnits(0);
    $('#productModal').modal('show');
});

$('#newStockProduct').on('keypress', (e) => {
    if (e.key === "Enter")
        $('#btnAddStock').trigger('click');
});

$('#btnAddStock').on('click', (e) => {
    let idProduct = e.currentTarget.getAttribute('data-id');
    let stock = $('#newStockProduct').val();
    let textSearchProduct = document.getElementById('textSearchProduct');
    let pageNumber = document.getElementById('pageNumber');

    if (stock != '' && stock > 0) {

        $('#loadingPage').fadeIn(1);

        UpdateStockProduct(idProduct, stock).then((res) => {

            if (res) {
                dinamycTimerAlert({ title: '¡Existencias actualizadas!', text: 'Las existencias fuerón agregadas con éxito.', type: 'success' });
                getProducts(textSearchProduct.value, pageNumber.value, 100);
                $('#AddStockProductModal').modal('hide');
            }
            else {
                $('#loadingPage').fadeOut(1);
                dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
            }

        });
    }
    else {
        dinamycTimerAlert({ title: '¡Existencias!', text: 'Es necesario que las existencias que se van a añadir sean mayores a 0.', type: 'error' });
    }
});

$('#applyWholesale').on('change', (e) => {
    let isActive = e.currentTarget.checked;
    let sectionWholesale = document.getElementById('sectionWholesale');

    if (isActive)
        sectionWholesale.classList.remove('disabled-section');
    else {
        sectionWholesale.classList.add('disabled-section');
    }
});

$('#salesPrice1').on('keyup', (e) => {
    let salesPrice1 = e.currentTarget;
    let purchasePrice = $('#purchasePrice').val() != '' ? Math.round($('#purchasePrice').val() * 100) / 100 : '';

    if (salesPrice1.value != '' && salesPrice1.value > 0) {

        let salePrice = Math.round(salesPrice1.value * 100) / 100;

        if (purchasePrice != '' && purchasePrice < salePrice) {

            //$('#percentageProfit1').val(Math.round((salePrice - purchasePrice) / salePrice * 100).toFixed(2)); //porcentaje con 2 decimales
            $('#percentageProfit1').val(Math.round((salePrice - purchasePrice) / salePrice * 100)); //porcentaje redondeado 0 decimales
            $('#revenue1').val(Math.round((salePrice - purchasePrice) * 100) / 100);
        }
    }
});

$('#percentageProfit1').on('keyup', (e) => {
    if (e.currentTarget.value > 99)
        e.currentTarget.value = 99;

    let percentageProfit1 = e.currentTarget.value != '' && e.currentTarget.value > 0 ? e.currentTarget.value : '';
    let purchasePrice = $('#purchasePrice').val() != '' && $('#purchasePrice').val() > 0 ? Math.round($('#purchasePrice').val() * 100) / 100 : '';

    if (percentageProfit1 != '') {

        if (purchasePrice != '') {

            $('#salesPrice1').val(Math.round((purchasePrice / (1 - (percentageProfit1 / 100))) * 100) / 100);
            $('#revenue1').val(Math.round(($('#salesPrice1').val() - purchasePrice) * 100) / 100);
        }
        else {
            e.currentTarget.value = '';
            dinamicAlert({ title: '¡Precio de compra!', text: 'El precio de compra debe ser mayor a 0 para calcular el precio de venta.', type: 'warning' });
        }
    }
    else {
        dinamicAlert({ title: '¡Porcentaje de utilidad!', text: 'El porcentaje de utilidad debe ser mayor a 0.', type: 'warning' });
    }
});

$('#salesPrice2').on('keyup', (e) => {
    let salesPrice2 = e.currentTarget;
    let purchasePrice = $('#purchasePrice').val() != '' ? Math.round($('#purchasePrice').val() * 100) / 100 : '';

    if (salesPrice2.value != '' && salesPrice2.value > 0) {

        let salePrice = Math.round(salesPrice2.value * 100) / 100;

        if (purchasePrice != '' && purchasePrice < salePrice) {

            //$('#percentageProfit2').val(Math.round((salePrice - purchasePrice) / salePrice * 100).toFixed(2)); //porcentaje con 2 decimales
            $('#percentageProfit2').val(Math.round((salePrice - purchasePrice) / salePrice * 100)); //porcentaje redondeado 0 decimales
            $('#revenue2').val(Math.round((salePrice - purchasePrice) * 100) / 100);
        }
    }
});

$('#percentageProfit2').on('keyup', (e) => {
    if (e.currentTarget.value > 99)
        e.currentTarget.value = 99;

    let percentageProfit2 = e.currentTarget.value != '' && e.currentTarget.value > 0 ? e.currentTarget.value : '';
    let purchasePrice = $('#purchasePrice').val() != '' && $('#purchasePrice').val() > 0 ? Math.round($('#purchasePrice').val() * 100) / 100 : '';


    if (percentageProfit2.value != '') {
        if (purchasePrice != '') {
            //$('#salesPrice2').val(Math.round(purchasePrice / (1 - (percentageProfit2.value / 100))).toFixed(2)); //porcentaje con 2 decimales
            $('#salesPrice2').val(Math.round(purchasePrice / (1 - (percentageProfit2 / 100)))); //porcentaje redondeado 0 decimales
            $('#revenue2').val(Math.round($('#salesPrice2').val() - purchasePrice));
        }
        else {
            dinamicAlert({ title: '¡Atención!', text: 'El precio de venta debe ser mayor al precio de compra.', type: 'warning' });
        }
    }
});

const buildTableProducts = (productModel) => {
    let previousPage = document.getElementById('previousPage');
    let pageNumber = document.getElementById('pageNumber');
    let totalPage = document.getElementById('totalPage');
    let nextPage = document.getElementById('nextPage');

    pageNumber.value = productModel.filters.pageNumber;
    totalPage.innerText = productModel.filters.totalPage;

    if (productModel.filters.pageNumber == 1)
        previousPage.setAttribute('disabled', '');
    else
        previousPage.removeAttribute('disabled');

    if (productModel.filters.pageNumber == productModel.filters.totalPage)
        nextPage.setAttribute('disabled', '');
    else
        nextPage.removeAttribute('disabled');

    let tblProducts = document.getElementById('tblProducts');
    tblProducts.innerHTML = '';

    productModel.products.map((item) => {

        let btnUpdateProduct = document.createElement('button');
        btnUpdateProduct.classList.add('btn', 'btn-secondary', 'm-1', 'btnUpdateProduct');

        let iconUpdate = document.createElement('i');
        iconUpdate.classList.add('fa-solid', 'fa-pen');

        btnUpdateProduct.append(iconUpdate);
        btnUpdateProduct.setAttribute('idProduct', item.productId);

        let btnDeleteProduct = document.createElement('button');
        btnDeleteProduct.classList.add('btn', 'btn-danger', 'm-1', 'btnDeleteProduct');

        let iconDelete = document.createElement('i');
        iconDelete.classList.add('fa-solid', 'fa-trash');

        btnDeleteProduct.append(iconDelete);
        btnDeleteProduct.setAttribute('idProduct', item.productId);

        let btnAddStockProduct = document.createElement('button');
        btnAddStockProduct.classList.add('btn', 'btn-info', 'm-1', 'btnAddStockProduct');

        let iconAdd = document.createElement('i');
        iconAdd.classList.add('fa-solid', 'fa-plus', 'text-white');

        btnAddStockProduct.append(iconAdd);
        btnAddStockProduct.setAttribute('idProduct', item.productId);

        let tr = document.createElement('tr');

        let barCode = document.createElement('th');
        barCode.innerText = item.barCode;
        barCode.setAttribute('colspan', '2');
        tr.appendChild(barCode);

        let nameProduct = document.createElement('th');
        nameProduct.innerText = item.nameProduct;
        nameProduct.setAttribute('colspan', '4');
        tr.appendChild(nameProduct);

        let description = document.createElement('th');
        description.innerText = item.description;
        description.setAttribute('colspan', '5');
        tr.appendChild(description);

        let expirationDate = document.createElement('th');
        expirationDate.innerText = item.expirationDate != null ? new Date(item.expirationDate).toLocaleDateString() : '';
        tr.appendChild(expirationDate);

        let measurementUnit = document.createElement('th');
        measurementUnit.innerHTML = item.icon;
        tr.appendChild(measurementUnit);

        let stock = document.createElement('th');
        stock.innerText = item.stock;
        tr.appendChild(stock);

        let minimumStock = document.createElement('th');
        minimumStock.innerText = item.minimumStock;
        tr.appendChild(minimumStock);

        let purchasePrice = document.createElement('th');
        purchasePrice.innerText = item.purchasePrice.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN'
        });
        tr.appendChild(purchasePrice);

        let salesPrice1 = document.createElement('th');
        salesPrice1.innerText = item.salesPrice1.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN'
        });
        tr.appendChild(salesPrice1);

        let percentageProfit1 = document.createElement('th');
        percentageProfit1.innerText = parseFloat(item.percentageProfit1).toFixed(2) + "%";
        tr.appendChild(percentageProfit1);

        let revenue1 = document.createElement('th');
        revenue1.innerText = item.revenue1.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN'
        });
        tr.appendChild(revenue1);

        //let salesPrice2 = document.createElement('th');
        //salesPrice2.innerText = item.salesPrice2 > 0 ? item.salesPrice2.toLocaleString('es-MX', {
        //    style: 'currency',
        //    currency: 'MXN'
        //}) : '';
        //tr.appendChild(salesPrice2);

        //let percentageProfit2 = document.createElement('th');
        //percentageProfit2.innerText = item.percentageProfit2 > 0 ? parseFloat(item.percentageProfit2).toFixed(2) + "%" : '';
        //tr.appendChild(percentageProfit2);

        //let revenue2 = document.createElement('th');
        //revenue2.innerText = item.revenue2 > 0 ? item.revenue2.toLocaleString('es-MX', {
        //    style: 'currency',
        //    currency: 'MXN'
        //}) : '';
        //tr.appendChild(revenue2);

        //let wholesale = document.createElement('th');
        //wholesale.innerHTML = item.wholesale2 > 0 ? `${item.wholesale2} <samll>${item.icon}</small>` : '';
        //tr.appendChild(wholesale);

        let deparmentName = document.createElement('th');
        deparmentName.innerText = item.deparmentName;
        tr.appendChild(deparmentName);

        let actions = document.createElement('th');
        actions.innerHTML = `${btnAddStockProduct.outerHTML} ${btnUpdateProduct.outerHTML} ${btnDeleteProduct.outerHTML}`;
        tr.appendChild(actions);

        tblProducts.appendChild(tr);

        $('.btnAddStockProduct').on('click', (e) => {
            let idProduct = e.currentTarget.getAttribute('idProduct');
            $('#loadingPage').fadeIn(1);

            getProductById(idProduct).then((res) => {
                if (res != null) {
                    $('#nameStockProduct').text(res.name);
                    $('#btnAddStock').attr('data-id', res.id);
                    $('#actuallyStockProduct').val(res.stock);
                    $('#newStockProduct').val('');
                    $('#AddStockProductModal').modal('show');
                    $('#loadingPage').fadeOut(1);
                }
                else {
                    $('#loadingPage').fadeOut(1);
                    dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                }
            });
        });

        $('.btnUpdateProduct').on('click', (e) => {
            $('#loadingPage').fadeIn(1);
            e.currentTarget.disabled = true;
            let productId = e.currentTarget.getAttribute('idProduct');

            getProductById(productId).then((product) => {
                if (product != null) {
                    buildModalProductEdit(product);
                }
                else {
                    $('#loadingPage').fadeOut(1);
                    dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                }
            });
        });

        $('.btnDeleteProduct').on('click', (e) => {
            let idProduct = parseInt(e.currentTarget.getAttribute('idProduct'));

            Swal.fire({
                title: '¿Estas seguro de eliminar?',
                text: "¡Los cambios no podran revertirse!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Aceptar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {

                    $('#loadingPage').fadeIn(1);

                    deleteProduct(idProduct).then((res) => {
                        if (res != null && res > 0) {
                            getProducts('', 1, 100);
                            dinamycTimerAlert({ title: '¡Eliminado correctamente!', text: 'El producto ha sido eliminado', type: 'success' });
                        }
                        else {
                            $('#loadingPage').fadeOut(1);
                            dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                        }
                    });
                }
            });
        });
    });
    $('#loadingPage').fadeOut(1);
}

document.getElementById('nextPage').addEventListener('click', (e) => {
    let textSearchInput = document.getElementById('textSearchProduct');
    let pageNumber = document.getElementById('pageNumber').value;

    if (pageNumber != '') {
        if (textSearchInput.value != '')
            getProducts(textSearchInput.value.trim(), parseInt(pageNumber, 10) + 1, 100);
        else
            getProducts('', parseInt(pageNumber, 10) + 1, 100);
    }
});

document.getElementById('previousPage').addEventListener('click', (e) => {
    let textSearchInput = document.getElementById('textSearchProduct');
    let pageNumber = document.getElementById('pageNumber').value;

    if (pageNumber != '') {
        if (textSearchInput.value != '')
            getProducts(textSearchInput.value.trim(), parseInt(pageNumber, 10) - 1, 100);
        else
            getProducts('', parseInt(pageNumber, 10) - 1, 100);
    }
});

document.getElementById('pageNumber').addEventListener('change', (e) => {
    let pageNumberInput = e.currentTarget;
    let pageNumber = pageNumberInput.value;
    let textSearchInput = document.getElementById('textSearchProduct');
    let totalPage = parseInt(document.getElementById('totalPage').textContent, 10);

    const regex = /^[1-9]\d*$/;

    if (regex.test(pageNumber) && parseInt(pageNumber, 10) <= totalPage) {
        if (textSearchInput.value != '')
            getProducts(textSearchInput.value.trim(), parseInt(pageNumber, 10), 100);
        else
            getProducts('', parseInt(pageNumber, 10), 100);
    }
    else {
        pageNumberInput.value = 1;

        if (textSearchInput.value != '') {
            getProducts(textSearchInput.value.trim(), parseInt(pageNumberInput.value, 10), 100);
        }
        else {
            getProducts('', parseInt(pageNumberInput.value, 10), 100);
        }
    }
});

document.getElementById('textSearchProduct').addEventListener('change', (e) => {
    document.getElementById('searchProduct').click();
});

document.getElementById('searchProduct').addEventListener('click', (e) => {
    let textSearchInput = document.getElementById('textSearchProduct');
    let pageNumber = 1;
    let totalPage = 5;

    if (textSearchInput.value != '')
        getProducts(textSearchInput.value.trim(), pageNumber, totalPage);
    else
        getProducts('', pageNumber, totalPage);
});

//document.getElementById('btnBulkLoadProduct').addEventListener('click', (e) => {
//    document.getElementById('inputFileBulkLoadProduct').click();
//});

//document.getElementById('inputFileBulkLoadProduct').addEventListener('change', (e) => {debugger
//    let inputFile = e.currentTarget.files[0];

//    if (inputFile) {
//        if (inputFile.type != 'text/csv')
//            return dynamicAlert({ type: 'error', title: '¡Archivo no valido!', text: 'Por favor, seleccione un archivo CSV.'});

//        let formData = new FormData();
//        formData.append('bulkLoadProductFile', inputFile);
//        const url = new URL(`${window.location.href}/UploadBulkLoadProduct`);

//        fetch(url, {
//            method: 'POST',
//            body: formData
//        })
//            .then(response => {
//                if (response.ok) {
//                    // Procesar respuesta exitosa
//                    console.log('Archivo subido exitosamente');
//                } else {
//                    // Manejar errores
//                    console.error('Error al subir el archivo');
//                }
//            })
//            .catch(error => {
//                console.error('Error de red:', error);
//            });
//    } else {
//        console.error('No se ha seleccionado ningún archivo.');
//    }
//});

const getProducts = (textSearch, pageNumber, pageSize) => {
    if (textSearch != '') {
        getProductByNameOrDescription(textSearch.trim(), parseInt(pageNumber, 10), pageSize).then((res) => {
            if (res != null && res.products.length > 0) {
                buildTableProducts(res);
            }
            else {
                document.getElementById('tblProducts').innerHTML = '';
                document.getElementById('pageNumber').value = '';
                document.getElementById('totalPage').innerText = '';
                dinamycTimerAlert({ 'type': 'warning', 'title': '¡No se encontraron coincidencias!', 'text': '' });
            }
        });
    }
    else {
        getAllProducts(parseInt(pageNumber, 10), pageSize).then((res) => {
            if (res != null && res.products.length > 0) {
                buildTableProducts(res);
            }
        });
    }
}

const buildModalProductEdit = (product) => {
    $('#titleProductModal').text('Modificar producto');
    $('#nameProduct').val(product.name);
    $('#barCode').val(product.barCode);
    $('#expirationDate').val(product.expirationDate != null ? getDateDDMMYYYYHHMMByDateTime(product.expirationDate) : '');
    $('#description').val(product.description);
    $('#stock').val(product.stock);
    $('#minimumStock').val(product.minimumStock);
    $('#purchasePrice').val(product.purchasePrice);

    //Costos menudeo
    $('#salesPrice1').val(product.priceProducts[0].salesPrice);
    $('#percentageProfit1').val(product.priceProducts[0].percentageProfit);
    $('#revenue1').val(product.priceProducts[0].revenue);
    $('#wholesale1').val(1);

    //Check aplica mayoreo 
    if (product.priceProducts.length > 1) {
        $('#applyWholesale').prop('checked', true);
        $('#sectionWholesale').removeClass('disabled-section');

        //Costos mayoreo
        $('#salesPrice2').val(product.priceProducts[1].salesPrice);
        $('#percentageProfit2').val(product.priceProducts[1].percentageProfit);
        $('#revenue2').val(product.priceProducts[1].revenue);
        $('#wholesale2').val(product.priceProducts[1].wholesale);
    }
    else {
        $('#applyWholesale').prop('checked', false);
        $('#sectionWholesale').addClass('disabled-section');

        //Costos mayoreo
        $('#salesPrice2').val('');
        $('#percentageProfit2').val('');
        $('#revenue2').val('');
        $('#wholesale2').val('');
    }

    $('#creationDate').val(product.creationDate);
    $('#modificationDate').val(product.modificationDate);
    $('#deletionDate').val(product.deletionDate);
    $('#userId').val(product.userId);
    $('#isActive').val(product.isActive);
    $('#productId').val(product.id);
    buildSelectDepartments(product.department.id);
    buildSelectMeasurementUnits(product.measurementUnit.id);
    $('#loadingPage').fadeOut(1);

}

const buildSelectDepartments = (departmentId) => {

    getAllDepartments().then((departments) => {

        if (departments != null && departments.length > 0) {
            let department = document.getElementById('department');
            department.innerHTML = '';

            if (departmentId == 0) {
                let option = document.createElement('option');
                option.value = 0;
                option.innerText = 'Seleccionar un departamento';
                department.appendChild(option);
            }

            departments.map((item) => {
                let option = document.createElement('option');
                option.value = item.id;
                option.innerText = item.name;

                if (departmentId > 0 && item.id == departmentId)
                    option.selected = true;

                department.appendChild(option);
            });

            $('#productModal').modal('show');
        }
    });
}

const buildSelectMeasurementUnits = (measurementUnitId) => {

    getMeasurementUnits().then((measurementUnits) => {

        if (measurementUnits != null && measurementUnits.length > 0) {

            let measurementUnit = document.getElementById('measurementUnit');
            measurementUnit.innerHTML = '';

            if (measurementUnitId == 0) {
                let option = document.createElement('option');
                option.value = 0;
                option.innerText = 'Seleccionar una unidad de medida';
                measurementUnit.appendChild(option);
            }

            measurementUnits.map((item) => {
                let option = document.createElement('option');
                option.value = item.id;
                option.innerText = item.name;

                if (measurementUnitId > 0 && item.id == measurementUnitId)
                    option.selected = true;

                measurementUnit.appendChild(option);
            });

            $('#productModal').modal('show');
        }
    });
}

const validateFormSaveProduct = () => {
    let nameProduct = $('#nameProduct').val();
    let barCode = $('#barCode').val();
    let description = $('#description').val();
    let expirationDate = $('#expirationDate').val();
    let stock = $('#stock').val();
    let minimumStock = $('#minimumStock').val();
    let purchasePrice = $('#purchasePrice').val();
    let department = $('#department').val();
    let measurementUnit = $('#measurementUnit').val();
    let salesPrice1 = $('#salesPrice1').val();
    let percentageProfit1 = $('#percentageProfit1').val();
    let revenue1 = $('#revenue1').val();
    let wholesale1 = $('#wholesale1').val();
    let salesPrice2 = $('#salesPrice2').val();
    let percentageProfit2 = $('#percentageProfit2').val();
    let revenue2 = $('#revenue2').val();
    let wholesale2 = $('#wholesale2').val();
    let applyWholesale = document.getElementById('applyWholesale').checked;
    let response = true;

    if (nameProduct == '') {
        dinamycTimerAlert({ title: '¡Nombre del producto!', text: 'El nombre del producto es requerido', type: 'error' });
        return !response;
    }

    //if (barCode == '') {
    //    dinamycTimerAlert({ title: '¡Codigo de barras!', text: 'El codigo de barras es requerido', type: 'error' });
    //    response = false;
    //}

    if (description == '') {
        dinamycTimerAlert({ title: '¡Descripción!', text: 'La descripción es requerida', type: 'error' });
        return !response;
    }

    if (expirationDate != '') {
        if (expirationDate < getDateYYYYMMDD()) {
            dinamycTimerAlert({ title: '¡Fecha de caducidad!', text: 'La fecha de caducidad no puede ser menor al dia actual.', type: 'error' });
            return !response;
        }
    }

    if (stock == '' || stock < 0.1) {
        dinamycTimerAlert({ title: '¡Cantidad!', text: 'La cantidad es requerida', type: 'error' });
        return !response;
    }

    if (minimumStock == '' || minimumStock < 1) {
        dinamycTimerAlert({ title: '¡Existencia minima!', text: 'La existencia minima es requerida', type: 'error' });
        return !response;
    }

    if (purchasePrice == '' || purchasePrice < 1) {
        dinamycTimerAlert({ title: '¡Precio de compra!', text: 'El precio de compra es requerido', type: 'error' });
        return !response;
    }

    if (department == '' || department < 1) {
        dinamycTimerAlert({ title: '¡Departamento!', text: 'El departamento es requerido', type: 'error' });
        return !response;
    }

    if (measurementUnit == '' || measurementUnit < 1) {
        dinamycTimerAlert({ title: '¡Unidad de medida!', text: 'La unidad de medida es requerida.', type: 'error' });
        return !response;
    }

    if (salesPrice1 == '' || salesPrice1 < 1) {
        dinamycTimerAlert({ title: '¡Precio de venta!', text: 'El precio de venta es requerido.', type: 'error' });
        return !response;
    }

    if (percentageProfit1 == '' || percentageProfit1 < 1) {
        dinamycTimerAlert({ title: '¡Porcentaje de utilidad!', text: 'El porcentaje de utilidad es requerido.', type: 'error' });
        return !response;
    }

    if (revenue1 == '' || revenue1 < 1) {
        dinamycTimerAlert({ title: '¡Ganancia!', text: 'La ganancia es requerida.', type: 'error' });
        return !response;
    }

    if (applyWholesale) {
        if (salesPrice2 == '' || salesPrice2 < 1) {
            dinamycTimerAlert({ title: '¡Precio de venta!', text: 'El precio de venta es requerido.', type: 'error' });
            return !response;
        }

        if (percentageProfit2 == '' || percentageProfit2 < 1) {
            dinamycTimerAlert({ title: '¡Porcentaje de utilidad!', text: 'El porcentaje de utilidad es requerido.', type: 'error' });
            return !response;
        }

        if (revenue2 == '' || revenue2 < 1) {
            dinamycTimerAlert({ title: '¡Ganancia!', text: 'La ganancia es requerida.', type: 'error' });
            return !response;
        }

        if (wholesale2 == '' || wholesale2 < 2) {
            dinamycTimerAlert({ title: '¡Cantidad mayoreo!', text: 'La cantidad de productos al mayoreo es requerida y debe ser mayor a 1.', type: 'error' });
            return !response;
        }
    }

    return response;
}

const clearFormSaveProduct = () => {
    $('#nameProduct').val('');
    $('#barCode').val('');
    $('#expirationDate').val('');
    $('#description').val('');
    $('#stock').val('');
    $('#minimumStock').val('');
    $('#purchasePrice').val('');

    //Costos menudeo
    $('#salesPrice1').val('');
    $('#percentageProfit1').val('');
    $('#revenue1').val('');
    $('#wholesale1').val('1');
    //Costos mayoreo
    $('#salesPrice2').val('');
    $('#percentageProfit2').val('');
    $('#revenue2').val('');
    $('#wholesale2').val('');

    $('#creationDate').val('');
    $('#modificationDate').val('');
    $('#deletionDate').val('');
    $('#isActive').val('');
    $('#productId').val(0);
    $('#department').val(0);
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
        timer: 3500
    });
}

const getDateYYYYMMDD = () => {
    const today = new Date().toLocaleDateString().split('/');
    const yyyy = today[2];
    let mm = today[1] < 10 ? `0${today[1]}` : today[1];
    let dd = today[0] < 10 ? `0${today[0]}` : today[0];

    return `${yyyy}-${mm}-${dd}`;
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

    let dformat = [day < 10 ? '0' + day : day, month < 10 ? '0' + month : month, year].reverse().join('-');

    return dformat;
}

/* * *  Call API  * */

const getAllProducts = async (pageNumber, pageSize) => {
    let data = new Array();
    const url = new URL(`${window.location.href}/GetAllProducts`);
    url.searchParams.set('pageNumber', pageNumber);
    url.searchParams.set('pageSize', pageSize);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const getProductByNameOrDescription = async (keyWord, pageNumber, pageSize) => {
    let data = new Array();
    const url = new URL(`${window.location.href}/GetProductByNameOrDescriptionPaginate`);
    url.searchParams.set('keyWord', keyWord);
    url.searchParams.set('pageNumber', pageNumber);
    url.searchParams.set('pageSize', pageSize);

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
    const url = new URL(`${window.location.href}/GetProductById`);
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

const createProduct = async (product) => {
    let data = '';
    const url = new URL(`${window.location.href}/CreateProduct`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    });

    data = await response.json();

    return data;
}

const updateProduct = async (product) => {
    let id = '';
    const url = new URL(`${window.location.href}/UpdateProduct`);

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(product)
    });

    id = await response.json();

    return id;
}

const UpdateStockProduct = async (productId, stock) => {
    let id = '';
    const url = new URL(`${window.location.href}/UpdateStockProduct`);
    url.searchParams.set('productId', productId);


    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(stock)
    });

    id = await response.json();

    return id;
}

const deleteProduct = async (productId) => {
    let id = '';
    const url = new URL(`${window.location.href}/DeleteProduct`);
    url.searchParams.set('productId', productId);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });

    id = await response.json();
    return id;
}

const getAllDepartments = async () => {
    let data = new Array();
    const url = new URL(`${window.location.href}/GetAllDepartments`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();
    return data;
}

const getMeasurementUnits = async () => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/Catalog/GetMeasurementUnit`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();
    return data;
}
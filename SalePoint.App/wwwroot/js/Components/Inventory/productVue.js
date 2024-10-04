var inventoryComponent = new Vue({
    el: '#inventory',
    data: {
        product: {
            priceProducts: []
        },
        listProducts: [],
        listDepartments: [],
        listMeasurementUnits: [],
        filters: {
            pageNumber: 1,
            pageSize: 100,
            totalPage: 0
        },
        imagePreviewStyle: {},
        limitFileSize: 5000000,
        imageProduct: null,
        loadingPreview: false,
        processingSavingProduct: false,
        countEmptySearch: 0,
        textKeyWord: '',
        titleProductModal: '',
        salesPrice: '',
        percentageProfit: '',
        revenue: '',
        salesPrice2: '',
        percentageProfit2: '',
        revenue2: '',
        newStockProduct: ''
    },
    computed: {
        paginationPages() {
            const totalPages = this.filters.totalPage;
            const currentPage = this.filters.pageNumber;
            const maxVisibleButtons = 5; // Número máximo de botones visibles
            const pages = [];

            if (totalPages <= maxVisibleButtons) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            }
            else {
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);

                if (startPage > 1) {
                    pages.push(1); // Primer número de página
                    if (startPage > 2) pages.push('...'); // Puntos suspensivos al inicio
                }

                for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                }

                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) pages.push('...'); // Puntos suspensivos al final
                    pages.push(totalPages); // Último número de página
                }
            }

            return pages;
        }
    },
    methods: {
        init() {
            $('#expirationDate').attr('min', this.getDateYYYYMMDD());
            $('#loadingPage').fadeIn(1);
            this.imagePreviewStyle = {
                background: `url('') no-repeat center center`,
                filter: '',
                backgroundSize: ''
            };
            this.getProducts();
            this.getDepartments();
            this.getMeasurementUnits();
        },
        getDepartments() {
            const url = new URL(`${window.location.href}/GetAllDepartments`);

            this.solicitudGetDinamico(url).then((res) => {
                if (res && typeof res === 'object' && res && res.length > 0) {
                    this.listDepartments = res;
                }
                else {
                    this.listDepartments = [];
                }
            });
        },
        getMeasurementUnits() {
            const url = new URL(`${window.location.origin}/Catalog/GetMeasurementUnit`);

            this.solicitudGetDinamico(url).then((res) => {
                if (res && typeof res === 'object' && res && res.length > 0) {
                    this.listMeasurementUnits = res;
                }
                else {
                    this.listMeasurementUnits = [];
                }
            });
        },
        getProducts() {
            $('#loadingPage').fadeIn(1);
            const url = new URL(`${window.location.origin}/Product/GetAllProducts`);
            url.searchParams.set('pageNumber', this.filters.pageNumber);
            url.searchParams.set('pageSize', this.filters.pageSize);
            url.searchParams.set('keyWord', this.textKeyWord.length < 1 ? '' : this.textKeyWord);

            this.solicitudGetDinamico(url).then((res) => {
                if (res && typeof res === 'object' && res && res.products.length > 0) {
                    //this.listProducts = res.products.map(product => {
                    //    // Usar directamente la propiedad ThumbnailBase64
                    //    if (product.thumbnailBase64) {
                    //        product.thumbnailBase64 = `data:image/png;base64,${product.thumbnailBase64}`;
                    //    }
                    //    return product;
                    //});
                    this.listProducts = res.products;
                    this.filters = res.filters;
                }
                else {
                    this.listProducts = [];
                }
            }).catch((err) => {
                this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
            }).finally(() => {
                $('#loadingPage').fadeOut(1);
            });
        },
        getProductById(productId) {
            this.clearFormSaveProduct();
            this.titleProductModal = 'Actualizar producto';

            const url = new URL(`${window.location.origin}/Product/GetProductById`);
            url.searchParams.set('productId', productId);

            this.solicitudGetDinamico(url).then((res) => {
                if (res && typeof res === 'object' && res && res.id > 0) {
                    this.product = res;
                    if (this.product.routeImage)
                        this.loadPreviewImage(null, this.product.routeImage);


                    //if (this.product.thumbnailBase64) {
                    //    this.product.thumbnailBase64 = `data:image/png;base64,${this.product.thumbnailBase64}`;
                    //    this.loadPreviewImage(null, this.product.thumbnailBase64);
                    //}
                    this.salesPrice = res.priceProducts.find(p => p.wholesale == 1)?.salesPrice ?? '';
                    this.percentageProfit = res.priceProducts.find(p => p.wholesale == 1)?.percentageProfit ?? '';
                    this.revenue = res.priceProducts.find(p => p.wholesale == 1)?.revenue ?? '';
                    $('#department').val(res.department.id);
                    $('#measurementUnit').val(res.measurementUnit.id);
                    $('#productModal').modal('show');
                }
                else {
                    this.product = {};
                }
            }).catch((err) => {
                this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
            }).finally(() => {
                $('#loadingPage').fadeOut(1);
            });
        },
        saveProduct() {
            if (this.product) {
                this.product.stock = Math.round(this.product.stock * 100) / 100;
                this.product.minimumStock = Math.round(this.product.minimumStock * 100) / 100;
                this.product.purchasePrice = Math.round(this.product.purchasePrice * 100) / 100;

                if (this.imageProduct != null) {
                    const formDataImageProduct = new FormData();
                    formDataImageProduct.append('productId', this.product.id);
                    formDataImageProduct.append('imageProduct', this.imageProduct);

                    const url = new URL(`${window.location.href}/SaveImageProduct`);
                    this.saveImageProduct(url, formDataImageProduct).then((res) => {
                        if (res && res.imagePath != "") {
                            this.product.routeImage = res.imagePath;
                            this.saveDataProduct();
                        }
                        else {
                            this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                        }
                    }).catch((err) => {
                        this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                    })

                    //this.convertFileToBase64(this.imageProduct)
                    //    .then((imageBase64) => {
                    //        this.product.thumbnailBase64 = imageBase64; // Asignar el array de bytes a imageProduct
                    //        this.saveDataProduct();
                    //    })
                    //    .catch((error) => {
                    //        this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'No fue posible guardar la imagen', type: 'error' });
                    //    });
                }
                else {
                    this.product.thumbnailBase64 = null;
                    this.saveDataProduct();
                }
            }
        },
        saveDataProduct() {
            if (this.validateFormSaveProduct()) {
                $('#loadingPage').fadeIn(1);

                if (this.product.id == 0 || this.product.id == '') {
                    //this.product.department
                    this.product.department.id = $('#department').val();
                    this.product.unitMeasureId = $('#measurementUnit').val();
                    this.product.priceProducts = [];
                    this.product.priceProducts.push({
                        "id": 0,
                        "productId": 0,
                        "salesPrice": Math.round(this.salesPrice1 * 100) / 100,
                        "percentageProfit": Math.round(this.percentageProfit * 100) / 100,
                        "revenue": Math.round(this.revenue * 100) / 100,
                        "wholesale": 1
                    });

                    const url = new URL(`${window.location.href}/CreateProduct`);

                    this.solicitudPostDinamico(url, this.product).then((productId) => {
                        if (productId != null && productId > 0) {
                            this.getProducts();
                            $('#btnCloseProductModal').trigger('click');
                            this.dinamycTimerAlert({ title: '¡Creado correctamente!', text: 'El producto fue creado', type: 'success' });
                        }
                        else {
                            this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                            $('#productModal').modal('show');
                        }
                    }).catch((err) => {
                        this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                    }).finally(() => {
                        $('#loadingPage').fadeOut(1);
                    });
                }
                else {
                    const url = new URL(`${window.location.href}/UpdateProduct`);

                    this.solicitudPutDinamico(url, this.product).then((productId) => {
                        if (productId != null && productId > 0) {
                            this.getProducts();
                            $('#btnCloseProductModal').trigger('click');
                            this.dinamycTimerAlert({ title: '¡Actualizado correctamente!', text: 'El producto fue actualizado', type: 'success' });
                        }
                        else {
                            this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                            $('#productModal').modal('show');
                        }
                    }).catch((err) => {
                        this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                    }).finally(() => {
                        $('#loadingPage').fadeOut(1);
                    });
                }
            }
        },
        handleKeyPressAddStock(e) {
            if (e.key === 'Enter')
                this.addStockProduct();
        },
        addStockProduct() {
            let stock = this.newStockProduct;

            if (stock != '' && stock > 0) {

                $('#loadingPage').fadeIn(1);
                const url = new URL(`${window.location.href}/UpdateStockProduct`);
                url.searchParams.set('productId', this.product.productId);

                this.solicitudPutDinamico(url, stock).then((res) => {
                    if (res) {
                        this.dinamycTimerAlert({ title: '¡Existencias actualizadas!', text: 'Las existencias fuerón agregadas con éxito.', type: 'success' });
                        this.getProducts();
                    }
                    else {
                        this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                    }

                }).finally(() => {
                    $('#AddStockProductModal').modal('hide');
                    $('#loadingPage').fadeOut(1);
                });
            }
            else {
                this.dinamycTimerAlert({ title: '¡Existencias!', text: 'Es necesario que las existencias que se van a añadir sean mayores a 0.', type: 'error' });
            }
        },
        roundedSalesPrice1(e) {
            let salesPrice1 = e.currentTarget;
            let purchasePrice = Math.round(this.product.purchasePrice * 100) / 100;

            if (salesPrice1.value != '' && salesPrice1.value > 0) {

                let salePrice = Math.round(salesPrice1.value * 100) / 100;

                if (purchasePrice != '' && purchasePrice < salePrice) {
                    this.percentageProfit = Math.round((salePrice - purchasePrice) / salePrice * 100); //porcentaje redondeado 0 decimales
                    this.revenue = Math.round((salePrice - purchasePrice) * 100) / 100;
                }
            }
        },
        validatePercentageProfit(e) {
            if (e.currentTarget.value > 99)
                e.currentTarget.value = 99;

            let percentageProfit1 = e.currentTarget.value != '' && e.currentTarget.value > 0 ? e.currentTarget.value : '';
            let purchasePrice = this.product.purchasePrice != '' && this.product.purchasePrice > 0 ? Math.round(this.product.purchasePrice * 100) / 100 : '';

            if (this.addStockProduct != '') {

                if (purchasePrice != '') {
                    this.salesPrice1 = Math.round((purchasePrice / (1 - (percentageProfit1 / 100))) * 100) / 100;
                    this.revenue = Math.round((this.salesPrice1 - purchasePrice) * 100) / 100;
                }
                else {
                    e.currentTarget.value = '';
                    this.dinamicAlert({ title: '¡Precio de compra!', text: 'El precio de compra debe ser mayor a 0 para calcular el precio de venta.', type: 'warning' });
                }
            }
            else {
                this.dinamicAlert({ title: '¡Porcentaje de utilidad!', text: 'El porcentaje de utilidad debe ser mayor a 0.', type: 'warning' });
            }
        },
        validateFormSaveProduct() {
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
            //let applyWholesale = document.getElementById('applyWholesale').checked;
            let response = true;

            if (nameProduct == '') {
                this.dinamycTimerAlert({ title: '¡Nombre del producto!', text: 'El nombre del producto es requerido', type: 'error' });
                return !response;
            }

            //if (barCode == '') {
            //    this.dinamycTimerAlert({ title: '¡Codigo de barras!', text: 'El codigo de barras es requerido', type: 'error' });
            //    response = false;
            //}

            if (description == '') {
                this.dinamycTimerAlert({ title: '¡Descripción!', text: 'La descripción es requerida', type: 'error' });
                return !response;
            }

            if (expirationDate != '') {
                if (expirationDate < this.getDateYYYYMMDD()) {
                    this.dinamycTimerAlert({ title: '¡Fecha de caducidad!', text: 'La fecha de caducidad no puede ser menor al dia actual.', type: 'error' });
                    return !response;
                }
            }

            if (stock == '' || stock < 0.1) {
                this.dinamycTimerAlert({ title: '¡Cantidad!', text: 'La cantidad es requerida', type: 'error' });
                return !response;
            }

            if (minimumStock == '' || minimumStock < 1) {
                this.dinamycTimerAlert({ title: '¡Existencia minima!', text: 'La existencia minima es requerida', type: 'error' });
                return !response;
            }

            if (purchasePrice == '' || purchasePrice < 1) {
                this.dinamycTimerAlert({ title: '¡Precio de compra!', text: 'El precio de compra es requerido', type: 'error' });
                return !response;
            }

            if (department == '' || department < 1) {
                this.dinamycTimerAlert({ title: '¡Departamento!', text: 'El departamento es requerido', type: 'error' });
                return !response;
            }

            if (measurementUnit == '' || measurementUnit < 1) {
                this.dinamycTimerAlert({ title: '¡Unidad de medida!', text: 'La unidad de medida es requerida.', type: 'error' });
                return !response;
            }

            if (salesPrice1 == '' || salesPrice1 < 1) {
                this.dinamycTimerAlert({ title: '¡Precio de venta!', text: 'El precio de venta es requerido.', type: 'error' });
                return !response;
            }

            if (percentageProfit1 == '' || percentageProfit1 < 1) {
                this.dinamycTimerAlert({ title: '¡Porcentaje de utilidad!', text: 'El porcentaje de utilidad es requerido.', type: 'error' });
                return !response;
            }

            if (revenue1 == '' || revenue1 < 1) {
                this.dinamycTimerAlert({ title: '¡Ganancia!', text: 'La ganancia es requerida.', type: 'error' });
                return !response;
            }

            //if (applyWholesale) {
            //    if (salesPrice2 == '' || salesPrice2 < 1) {
            //        this.dinamycTimerAlert({ title: '¡Precio de venta!', text: 'El precio de venta es requerido.', type: 'error' });
            //        return !response;
            //    }

            //    if (percentageProfit2 == '' || percentageProfit2 < 1) {
            //        this.dinamycTimerAlert({ title: '¡Porcentaje de utilidad!', text: 'El porcentaje de utilidad es requerido.', type: 'error' });
            //        return !response;
            //    }

            //    if (revenue2 == '' || revenue2 < 1) {
            //        this.dinamycTimerAlert({ title: '¡Ganancia!', text: 'La ganancia es requerida.', type: 'error' });
            //        return !response;
            //    }

            //    if (wholesale2 == '' || wholesale2 < 2) {
            //        this.dinamycTimerAlert({ title: '¡Cantidad mayoreo!', text: 'La cantidad de productos al mayoreo es requerida y debe ser mayor a 1.', type: 'error' });
            //        return !response;
            //    }
            //}

            return response;
        },
        restoreFilters() {
            this.filters = {
                pageNumber: 1,
                pageSize: 100,
                totalPage: 0
            };
            this.textKeyWord = '';
        },
        restoreProduct() {
            this.product = {
            }
        },
        searchProduct() {
            if (this.textKeyWord == '')
                this.countEmptySearch++;
            else
                this.countEmptySearch = 0;

            //Evitamos que la busqueda se realice mas de una vez cuando la palabra clave sea vacia
            if (this.countEmptySearch < 2) {
                this.filters.pageNumber = 1;
                this.getProducts();
            }
        },
        changePage(page) {
            if (page !== '...') {
                this.textKeyWord = this.filters.length < 1 ? '' : this.textKeyWord;
                this.filters.pageNumber = page;
                this.getProducts();
            }
        },
        formatCurrency(value) {
            if (value > 0) {
                // Formatea el valor como moneda (ej. USD, EUR, etc.)
                return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
            }
            // Si es 0 o menor, devuelve el valor sin formato
            return value;
        },
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            const year = d.getFullYear();
            return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
        },
        updateExpirationDate(value) {
            this.product.expirationDate = value;
        },
        dropImage(event) {
            event.preventDefault();
            this.loadingPreview = true; // Mostrar el spinner
            const file = event.dataTransfer.files[0];

            if (this.validateImageExtension(file))
                this.loadPreviewImage(file);
            else
                this.loadingPreview = false; // Ocultar el spinner si no es una imagen válida            
        },
        selectedImage(event) {
            const file = event.target.files[0];

            if (this.validateImageExtension(file)) {
                this.loadingPreview = true; // Mostrar el spinner
                this.loadPreviewImage(file);
            }
        },
        loadPreviewImage(file, imageBase64) {
            if (!imageBase64 && file) {
                this.imageProduct = file;
                const reader = new FileReader();

                reader.onload = (e) => {
                    setTimeout(() => {
                        this.imagePreviewStyle.background = `url(${e.target.result}) no-repeat center center`;
                        this.imagePreviewStyle.backgroundSize = 'cover !important';
                        this.imagePreviewStyle.filter = '';
                        this.loadingPreview = false;
                    }, 1000); // Introduce un retraso artificial de 1 segundo
                };

                reader.onerror = (e) => {
                    this.initializeLoadImage();
                };
                reader.readAsDataURL(file);
            }
            else if (imageBase64) {
                this.imagePreviewStyle.background = `url('${imageBase64}') no-repeat center center`;
                this.imagePreviewStyle.backgroundSize = 'cover';
                this.loadingPreview = false;
            }
            else
                this.initializeLoadImage();
        },
        deletePreviewImage() {
            this.initializeLoadImage();
            this.product.thumbnailBase64 = '';
            this.product.routeImage = null;
        },
        openModalNewProduct() {
            $('#titleProductModal').text('Crear producto');
            this.clearFormSaveProduct();
            $('#productModal').modal('show');
        },
        openModalAddStockProduct(product) {
            this.newStockProduct = '';
            this.product = product;
            $('#AddStockProductModal').modal('show');
        },
        openModalDeleteProduct(productId) {
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

                    const url = new URL(`${window.location.href}/DeleteProduct`);
                    url.searchParams.set('productId', productId);

                    this.solicitudDeleteDinamico(url).then((res) => {
                        if (res != null && res > 0) {
                            this.getProducts();
                            this.dinamycTimerAlert({ title: '¡Eliminado correctamente!', text: 'El producto ha sido eliminado', type: 'success' });
                        }
                        else {
                            $('#loadingPage').fadeOut(1);
                            this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                        }
                    }).catch((err) => {
                        this.dinamicAlert({ title: '¡Ocurrio un error!', text: 'Por favor recargue la pagína e intente nuevamente', type: 'error' });
                    }).finally(() => {
                        $('#loadingPage').fadeOut(1);
                    });
                }
            });
        },
        validateImageExtension(file) {
            if (file) {
                if (file.size > this.limitFileSize || file.type !== 'image/png') {
                    this.initializeLoadImage();
                    this.dinamicAlert({ title: '¡Tamaño de imagen!', text: 'La imagen no debe ser mayor a 5Mb y el formato admitido es PNG', type: 'error' });
                    return false;
                }
                return true;
            }
            return false;
        },
        validateMinimumStock(e) {
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
        },
        clearFormSaveProduct() {
            this.product = {
                "id": 0,
                "name": '',
                "barCode": '',
                "expirationDate": null,
                "description": '',
                "stock": '',
                "minimumStock": '',
                "purchasePrice": '',
                "routeImage": null,
                "thumbnail": null,
                "unitMeasureId": '',
                "isActive": true,
                "creationDate": null,
                "modificationDate": null,
                "deletionDate": null,
                "userId": 0,
                "department": {
                    "id": 0,
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
                    "id": 0,
                    "name": null,
                    "icon": null,
                    "creationDate": null,
                    "modificationDate": null,
                    "deletionDate": null,
                    "isActive": true
                },
                priceProducts: []
            };

            this.salesPrice = '';
            this.salesPrice = '';
            this.percentageProfit = '';
            this.revenue = '';
            this.salesPrice2 = '';
            this.percentageProfit2 = '';
            this.revenue2 = '';
            this.newStockProduct = '';
            $('#measurementUnit').val(0);
            $('#department').val(0);
            this.initializeLoadImage();
        },
        initializeLoadImage() {
            this.imagePreviewStyle.background = `url('') no-repeat center center`;
            this.imagePreviewStyle.filter = '';
            this.imagePreviewStyle.backgroundSize = '';
            $('#rutaImagen').val('');
            this.imageProduct = null;
            this.loadingPreview = false;
        },
        dinamicAlert(settings) {
            Swal.fire({
                title: settings.title,
                text: settings.text,
                icon: settings.type,
                showCancelButton: false,
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Aceptar'
            })
        },
        dinamycTimerAlert(settings) {
            Swal.fire({
                position: 'top-end',
                icon: settings.type,
                title: settings.title,
                text: settings.text,
                showConfirmButton: false,
                timer: 3500
            });
        },
        getDateYYYYMMDD() {
            const today = new Date().toLocaleDateString().split('/');
            const yyyy = today[2];
            let mm = today[1] < 10 ? `0${today[1]}` : today[1];
            let dd = today[0] < 10 ? `0${today[0]}` : today[0];

            return `${yyyy}-${mm}-${dd}`;
        },
        convertFileToBinary(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const arrayBuffer = e.target.result;
                    const bytes = new Uint8Array(arrayBuffer); // Convertimos a array de bytes
                    resolve(bytes); // Resolvemos la promesa con el array de bytes
                };

                reader.onerror = (e) => {
                    reject("Error al leer el archivo");
                };

                reader.readAsArrayBuffer(file); // Leer el archivo como ArrayBuffer
            });
        },
        async uploadUpgradeInventory() {
            const { value: file } = await Swal.fire({
                title: "Actualizar inventario",
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Aceptar',
                input: "file",
                inputAttributes: {
                    "accept": "text/csv",
                    "aria-label": ""
                }
            });

            if (file) {

                if (file.type !== 'text/csv') {
                    this.dinamicAlert({ title: '¡Formato de archivo!', text: 'El formato de archivo debe ser .csv', type: 'error' });
                    return false;
                }

                $('#loadingPage').fadeIn(1);

                // Crear FormData y adjuntar el archivo CSV
                const formData = new FormData();
                formData.append('productsCsv', file);

                // Realizar la solicitud fetch
                try {
                    const response = await fetch(`${window.location.href}/UpgradeBulkLoadProducts`, {
                        method: 'PUT',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Error en la solicitud.');
                    }
                    
                    // Revisar el tipo de contenido de la respuesta
                    const contentType = response.headers.get("content-type");

                    if (contentType && contentType.includes("application/json")) {
                        // Si la respuesta es JSON (sin errores)
                        const result = await response.json();

                        this.dinamycTimerAlert({ title: '¡Productos actualizados correctamente!', text: '', type: 'success' });

                    }
                    else if (contentType && contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
                        // Si la respuesta es un archivo Excel (con errores)
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Productos_con_error.xlsx');
                        document.body.appendChild(link);
                        link.click();
                        link.remove();

                        this.dinamicAlert({ title: '¡Ocurrieron errores!', text: 'Se descargo un archivo excel con los errores.', type: 'error' });
                    }

                } catch (error) {
                    this.dinamicAlert({ title: '¡Ocurrió un error!', text: 'Por favor recargue la página e intente nuevamente', type: 'error' });
                } finally {
                    $('#loadingPage').fadeOut(1);
                }
            }
            else {
                this.dinamicAlert({ title: '¡Archivo!', text: 'El archivo es requerido', type: 'warning' });

            }
        },
        async downloadInventory() {
            $('#loadingPage').fadeIn(1);
            try {
                const response = await fetch(`${window.location.href}/DownloadInventory?totalPages=${this.filters.totalPage}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('Error al descargar el archivo');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'InventarioProductos.xlsx');
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
            catch (error) {
                console.error('Error descargando el inventario:', error);
            }
            finally {
                $('#loadingPage').fadeOut(1);
            }
        },
        async saveImageProduct(url, data) {
            const response = await fetch(url, {
                method: "POST",
                body: data
            });

            if (!response.ok)
                console.log('Error al realizar la solicitud');

            const responseData = await response.json();

            return responseData;
        },
        async convertFileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    // Obtener la cadena Base64 completa
                    const dataUrl = reader.result;

                    // Extraer solo la parte Base64 (después del prefijo)
                    const base64String = dataUrl.split(',')[1];

                    // Resolver la promesa con la cadena Base64 limpia
                    resolve(base64String);
                };
                reader.onerror = error => reject(error);
            });
        },
        async loadImageProduct(bytesImage) {
            try {
                const blob = bytesImage; // Convertir la respuesta a Blob

                // Convertir Blob a Base64 usando FileReader
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.imagenBase64 = reader.result; // Asignar la imagen Base64 al data de Vue
                };
                reader.readAsDataURL(blob); // Leer el Blob como un Data URL (Base64)
            } catch (error) {
                console.error('Error al cargar la imagen:', error);
            }
        },
        async solicitudGetDinamico(url) {

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
            });

            if (!response.ok)
                console.log('Error al realizar la solicitud');

            const responseData = await response.json();

            return responseData;
        },
        async solicitudDeleteDinamico(url) {

            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
            });

            if (!response.ok)
                console.log('Error al realizar la solicitud');

            const responseData = await response.json();

            return responseData;
        },
        async solicitudPostDinamico(url, data) {

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify(data)
            });

            if (!response.ok)
                console.log('Error al realizar la solicitud');

            const responseData = await response.json();

            return responseData;
        },
        async solicitudPutDinamico(url, data) {

            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify(data)
            });

            if (!response.ok)
                console.log('Error al realizar la solicitud');

            const responseData = await response.json();

            return responseData;
        },
        async solicitudPutDinamicoForm(url, data) {

            const response = await fetch(url, {
                method: "PUT",
                body: data
            });

            if (!response.ok)
                console.log('Error al realizar la solicitud');

            const responseData = await response.json();

            return responseData;
        }
    },
    created() {
        this.init();
    }
});
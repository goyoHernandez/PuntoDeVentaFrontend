$(() => {
    $('#tableExpiringSoonProducts').DataTable({
        scrollX: true,
        language: language,
        destroy: true,
        order: [[0, 'desc']],
        lengthChange: false,
        pageLength: 5,
        paging: true,
        info: false,
        searching: false,
        ordering: false,
        scrollCollapse: true,
        fixedColumns: {
            'left': 1,
            'right': 1
        },
        columns: [
            { data: 'barCode' },
            { data: 'name' },
            { data: 'expirationDate' },
        ]
    });

    $('#tableProductsNearCompletition').DataTable({
        scrollX: true,
        language: language,
        destroy: true,
        order: [[0, 'desc']],
        lengthChange: false,
        pageLength: 5,
        paging: true,
        info: false,
        searching: false,
        scrollCollapse: true,
        ordering: false,
        fixedColumns: {
            'left': 1,
            'right': 1
        },
        columns: [
            { data: 'barCode' },
            { data: 'name' },
            { data: 'stock' },
        ]
    });

    if (localStorage.getItem("ticketInfo") == null)
        buildTicket();

    buildTableGetProductsNearCompletition();
    //buildTableExpiringSoonProducts();
});

const buildTicket = () => {
    GetInfoTicket().then((res) => {
        if (res != null && res.id > 0)
            localStorage.setItem("ticketInfo", JSON.stringify(res));
    });
}

const buildTableExpiringSoonProducts = () => {
    let tableExpiringSoonProducts = $('#tableExpiringSoonProducts').DataTable();
    let data = new Array();

    GetProductsExpiringSoon().then((products) => {
        if (products != null) {
            products.map((item) => {

                data.push({
                    'barCode': item.barCode,
                    'name': `${item.name} ${item.description}`,
                    'expirationDate': new Date(item.expirationDate).toLocaleDateString(),
                });
            });

            tableExpiringSoonProducts.clear().draw();
            tableExpiringSoonProducts.rows.add(data); // Add new data
            tableExpiringSoonProducts.columns.adjust().draw(); // Redraw the DataTable
        }
    });
}

const buildTableGetProductsNearCompletition = () => {
    let tableProductsNearCompletition = $('#tableProductsNearCompletition').DataTable();
    let data = new Array();

    GetProductsNearCompletition().then((products) => {
        if (products != null) {
            products.map((item) => {

                data.push({
                    'barCode': item.barCode,
                    'name': `${item.name} ${item.description}`,
                    'stock': item.stock
                });
            });

            tableProductsNearCompletition.clear().draw();
            tableProductsNearCompletition.rows.add(data); // Add new data
            tableProductsNearCompletition.columns.adjust().draw(); // Redraw the DataTable
        }
    });
}

/* * *  Call API  * */

const GetInfoTicket = async () => {
    let data = '';
    const url = new URL(`${window.location.origin}/Ticket/GetTicket`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const GetProductsExpiringSoon = async () => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/Product/GetProductsExpiringSoon`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}

const GetProductsNearCompletition = async () => {
    let data = new Array();
    const url = new URL(`${window.location.origin}/Product/GetProductsNearCompletition`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    data = await response.json();

    return data;
}
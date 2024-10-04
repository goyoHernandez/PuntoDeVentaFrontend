var expiredProductsComponent = new Vue({
    el: '#homeSalePoint',
    data: {
        listExpiredProducts: [],
        listMissingProducts: []
    },
    methods: {
        init() {
            this.buildTableExpiringSoonProducts();
            this.buildTableGetProductsNearCompletition();
        },
        buildTableExpiringSoonProducts() {
            const url = new URL(`${window.location.origin}/Product/GetProductsExpiringSoon`);
            
            this.solicitudGetDinamico(url).then((res) => {
                if (res && typeof res === 'object' && res && res.length > 0) {
                    this.listExpiredProducts = res;
                }
                else {
                    this.listExpiredProducts = [];
                }
            });

        },
        buildTableGetProductsNearCompletition() {
            const url = new URL(`${window.location.origin}/Product/GetProductsNearCompletition`);

            this.solicitudGetDinamico(url).then((res) => {
                if (res && typeof res === 'object' && res && res.length > 0) {
                    this.listMissingProducts = res;
                }
                else {
                    this.listMissingProducts = [];
                }
            });
        },
        async solicitudGetDinamico(url) {

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
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
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
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
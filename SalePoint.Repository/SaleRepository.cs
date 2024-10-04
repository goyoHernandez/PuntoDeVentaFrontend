using Microsoft.Extensions.Options;
using SalePoint.Primitives;
using SalePoint.Primitives.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SalePoint.Repository
{
    public class SaleRepository : ISaleRepository
    {
        private readonly IHttpClientFactory _httpClient;
        private readonly JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };

        public SaleRepository(IHttpClientFactory httpClient)
        {
            _httpClient = httpClient;
        }


        public async Task<List<Sale>> GetSalesByUserId(FilterSaleProducts filterSaleProducts, string token)
        {
            List<Sale> sales = new();
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                string? jsonString = JsonSerializer.Serialize(filterSaleProducts);
                StringContent? requestContent = new(jsonString, Encoding.UTF8, "application/json");

                HttpResponseMessage? response = await client.PostAsync($"Sale/getSales", requestContent);

                if (response != null && response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    sales = JsonSerializer.Deserialize<List<Sale>>(content, options)!;
                }

                return sales;
            }
            catch
            {
                return sales;
            }
        }

        public async Task<int> ReturnProduct(ProductReturns productReturns, string token)
        {
            int productReturnId = 0;
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                string? jsonString = JsonSerializer.Serialize(productReturns);
                StringContent? requestContent = new(jsonString, Encoding.UTF8, "application/json");

                HttpResponseMessage? response = await client.PostAsync("Sale/productReturns", requestContent);

                if (response != null && response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    productReturnId = JsonSerializer.Deserialize<int>(content, options);
                }

                return productReturnId;
            }
            catch
            {
                return productReturnId;
            }
        }
    }
}

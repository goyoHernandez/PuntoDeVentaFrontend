using SalePoint.Primitives;
using SalePoint.Primitives.Interfaces;
using System.Text;
using System.Text.Json;

namespace SalePoint.Repository
{
    public class SellRepository : ISellRepository
    {
        private readonly IHttpClientFactory _httpClient;
        private readonly JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };

        public SellRepository(IHttpClientFactory httpClient)
        {
            _httpClient = httpClient;
        }


        public async Task<int> SellItems(List<SellerItemsType> sellerItemsTypes, string token)
        {
            int saleId = 0;
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                string? jsonString = JsonSerializer.Serialize(sellerItemsTypes);
                StringContent? requestContent = new(jsonString, Encoding.UTF8, "application/json");

                HttpResponseMessage? response = await client.PostAsync("Sale", requestContent);

                if (response != null && response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    saleId = JsonSerializer.Deserialize<int>(content, options);
                }

                return saleId;
            }
            catch
            {
                return saleId;
            }
        }
    }
}
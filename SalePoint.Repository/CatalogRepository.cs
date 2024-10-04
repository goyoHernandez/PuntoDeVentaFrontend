using SalePoint.Primitives;
using SalePoint.Primitives.Interfaces;
using System.Text.Json;

namespace SalePoint.Repository
{
    public class CatalogRepository : ICatalogRepository
    {
        private readonly IHttpClientFactory _httpClient;
        private readonly JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };

        public CatalogRepository(IHttpClientFactory httpClient)
        {
            _httpClient = httpClient;
        }
        public async Task<IEnumerable<MeasurementUnit>?> GetMeasurementUnit(string token)
        {
            IEnumerable<MeasurementUnit>? measurementUnits = null;
            try
            {
                var client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var response = await client.GetAsync("MeasurementUnit");

                if (response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    measurementUnits = JsonSerializer.Deserialize<List<MeasurementUnit>>(content, options);
                }

                return measurementUnits;
            }
            catch
            {
                return null;
            }
        }
    }
}
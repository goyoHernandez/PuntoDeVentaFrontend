using SalePoint.Primitives;
using SalePoint.Primitives.Interfaces;
using System.Text;
using System.Text.Json;

namespace SalePoint.Repository
{
    public class CashRegisterRepository : ICashRegisterRepository
    {
        private readonly IHttpClientFactory _httpClient;
        private readonly JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };

        public CashRegisterRepository(IHttpClientFactory httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<int> ApplyCashFlows(CashFlows cashFlows, string token)
        {
            int rowAffected = 0;
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                string? jsonString = JsonSerializer.Serialize(cashFlows);
                StringContent? requestContent = new(jsonString, Encoding.UTF8, "application/json");

                HttpResponseMessage? response = await client.PostAsync("CashRegister/CashFlow", requestContent);

                if (response != null && response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    rowAffected = JsonSerializer.Deserialize<int>(content, options);
                }

                return rowAffected;
            }
            catch
            {
                return rowAffected;
            }
        }

        public async Task<int> CloseCashRegister(CashRegister cashRegister, string token)
        {
            int cashRegisterId = 0;
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                string? jsonString = JsonSerializer.Serialize(cashRegister);
                StringContent? requestContent = new(jsonString, Encoding.UTF8, "application/json");

                HttpResponseMessage? response = await client.PutAsync("CashRegister/Close", requestContent);

                if (response != null && response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    cashRegisterId = JsonSerializer.Deserialize<int>(content, options);
                }

                return cashRegisterId;
            }
            catch
            {
                return cashRegisterId;
            }
        }

        public async Task<IEnumerable<CashRegister>?> GetAllCashRegisterByUserId(int? userId, string token)
        {
            IEnumerable<CashRegister>? cashRegisters = null;
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                HttpResponseMessage response = await client.GetAsync($"CashRegister/Get/ByUserId/{userId}");

                if (response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    cashRegisters = JsonSerializer.Deserialize<List<CashRegister>>(content, options);
                }

                return cashRegisters;
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<CashFlows>?> GetCashFlowsDetail(int boxCutId, int cashFlowsType,string token)
        {
            IEnumerable<CashFlows>? cashFlows = null;
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                HttpResponseMessage response = await client.GetAsync($"CashRegister/Get/cashFlowsDetail/boxCutId/{boxCutId}/cashFlowsType/{cashFlowsType}");

                if (response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    cashFlows = JsonSerializer.Deserialize<List<CashFlows>>(content, options);
                }

                return cashFlows;
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<Sale>?> GetProductReturnsDetail(int boxCutId, string token)
        {
            IEnumerable<Sale>? sales = null;
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                HttpResponseMessage response = await client.GetAsync($"CashRegister/Get/productReturnsDetail/boxCutId/{boxCutId}");

                if (response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    sales = JsonSerializer.Deserialize<List<Sale>>(content, options);
                }

                return sales;
            }
            catch
            {
                return null;
            }
        }

        public async Task<int> OpenCashRegister(InitialAmount initialAmount, string token)
        {
            int cashRegisterId = 0;
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                string? jsonString = JsonSerializer.Serialize(initialAmount);
                StringContent? requestContent = new(jsonString, Encoding.UTF8, "application/json");

                HttpResponseMessage? response = await client.PostAsync("CashRegister/Open", requestContent);

                if (response != null && response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    cashRegisterId = JsonSerializer.Deserialize<int>(content, options);
                }

                return cashRegisterId;
            }
            catch
            {
                return cashRegisterId;
            }
        }

        public async Task<BoxCutOpen?> ValidateBoxCutOpen(int userId, decimal change, string token)
        {
            BoxCutOpen? boxCutOpen = new();
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                string? jsonString = JsonSerializer.Serialize(change);
                StringContent? requestContent = new(jsonString, Encoding.UTF8, "application/json");

                HttpResponseMessage? response = await client.PostAsync($"CashRegister/Get/BoxCutOpen/userId/{userId}", requestContent);

                if (response != null && response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    boxCutOpen = JsonSerializer.Deserialize<BoxCutOpen>(content, options);
                }

                return boxCutOpen;
            }
            catch
            {
                return boxCutOpen;
            }
        }
    }
}
using SalePoint.Primitives;
using SalePoint.Primitives.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SalePoint.Repository
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly IHttpClientFactory _httpClient;
        private readonly JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };

        public DepartmentRepository(IHttpClientFactory httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<Department>?> GetAllDepartments(string token)
        {
            IEnumerable<Department>? departments = null;
            try
            {
                var client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var response = await client.GetAsync("Department/Get");

                if (response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    departments = JsonSerializer.Deserialize<List<Department>>(content, options);
                }

                return departments;
            }
            catch
            {
                return null;
            }
        }
    }
}

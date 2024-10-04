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
    public class TicketRepository : ITicketRepository
    {
        private readonly IHttpClientFactory _httpClient;
        private readonly JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };

        public TicketRepository(IHttpClientFactory httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> CreateTicket(Ticket ticket, string token)
        {
            try
            {
                HttpClient client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                string? jsonString = JsonSerializer.Serialize(ticket);
                StringContent? requestContent = new(jsonString, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync("Ticket/Create", requestContent);

                if (response != null && response.IsSuccessStatusCode)
                    return true;

                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<Ticket?> GetTicket(string token)
        {
            Ticket? ticket = new();
            try
            {
                var client = _httpClient.CreateClient("SalePoinApi");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                HttpResponseMessage response = await client.GetAsync("Ticket/Get");

                if (response.IsSuccessStatusCode)
                {
                    string? content = await response.Content.ReadAsStringAsync();
                    ticket = JsonSerializer.Deserialize<Ticket>(content, options);
                }

                return ticket;
            }
            catch
            {
                return null;
            }
        }
    }
}
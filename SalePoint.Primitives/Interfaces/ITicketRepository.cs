using System.Net.Sockets;

namespace SalePoint.Primitives.Interfaces
{
    public interface ITicketRepository
    {
        Task<bool> CreateTicket(Ticket ticket, string token);

        Task<Ticket?> GetTicket(string token);
    }
}
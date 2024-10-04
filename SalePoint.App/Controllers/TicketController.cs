using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalePoint.Primitives.Interfaces;

namespace SalePoint.App.Controllers
{
    [Authorize(Roles = "Administrador")]
    public class TicketController : Controller
    {        
        public IActionResult Index()
        {
            return View();
        }

        private readonly ITicketRepository _ticketRepository;

        public TicketController(ITicketRepository ticketRepository)
        {
            _ticketRepository = ticketRepository ?? throw new ArgumentNullException(nameof(ticketRepository));
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetTicket()
        {
            return Json(await _ticketRepository.GetTicket(HttpContext.Session.GetString("TokenAuth")!));
        }
    }
}

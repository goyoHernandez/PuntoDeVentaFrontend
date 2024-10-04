using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SalePoint.App.Controllers
{
    public class ReportController : Controller
    {
        [Authorize(Roles = "Administrador")]
        public IActionResult Index()
        {
            return View();
        }
    }
}

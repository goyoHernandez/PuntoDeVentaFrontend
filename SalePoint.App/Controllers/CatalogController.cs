using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalePoint.Primitives.Interfaces;

namespace SalePoint.App.Controllers
{
    public class CatalogController : Controller
    {
        private readonly ICatalogRepository _catalogRepository;

        public CatalogController(ICatalogRepository catalogRepository)
        {
            _catalogRepository = catalogRepository ?? throw new ArgumentNullException(nameof(catalogRepository));
        }

        [Authorize]
        [HttpGet]

        public async Task<IActionResult> GetMeasurementUnit()
        {
            return Ok(await _catalogRepository.GetMeasurementUnit(HttpContext.Session.GetString("TokenAuth")!));
        }
    }
}
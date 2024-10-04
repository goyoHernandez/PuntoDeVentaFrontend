using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using SalePoint.Primitives;
using SalePoint.Primitives.Interfaces;
using System.Security.Claims;

namespace SalePoint.App.Controllers
{
    public class SaleController : Controller
    {
        private readonly ISaleRepository _saleRepository;

        public SaleController(ISaleRepository saleRepository)
        {
            _saleRepository = saleRepository ?? throw new ArgumentNullException(nameof(saleRepository));
        }

        [Authorize]
        public IActionResult Index()
        {
            return View();
        }

        [Authorize]
        public async Task<IActionResult> GetSalesByUserId([FromBody] FilterSaleProducts filterSaleProducts)
        {
            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                int userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).First()!);
                filterSaleProducts.UserId = userId;

                return Ok(await _saleRepository.GetSalesByUserId(filterSaleProducts, HttpContext.Session.GetString("TokenAuth")!));
            }
            return Ok(null);

        }

        [Authorize]
        public async Task<IActionResult> ReturnProduct([FromBody] ProductReturns productReturns)
        {
            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                int userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).First()!);
                productReturns.UserId = userId;

                return Ok(await _saleRepository.ReturnProduct(productReturns, HttpContext.Session.GetString("TokenAuth")!));
            }
            return Ok(null);
        }
    }
}
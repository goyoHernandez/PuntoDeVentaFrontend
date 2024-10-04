using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalePoint.Primitives.Interfaces;
using SalePoint.Primitives;
using System.Security.Claims;

namespace SalePoint.App.Controllers
{
    public class SellController : Controller
    {
        private readonly ISellRepository _sellRepository;

        public SellController(ISellRepository sellRepository)
        {
            _sellRepository = sellRepository ?? throw new ArgumentNullException(nameof(sellRepository));
        }

        [Authorize]
        public IActionResult Index()
        {
            ViewBag.UserName = "";
            ViewBag.UserId = "";
            ViewBag.UserRol = "";

            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                var rol = claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Role)
                                   .Select(c => c.Value).SingleOrDefault();

                //if (rol != "Administrador")
                //{
                    ViewBag.UserRol = rol;

                    // Get the claims values
                    ViewBag.UserName = claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Name)
                                       .Select(c => c.Value).SingleOrDefault();

                    ViewBag.UserId = claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid)
                                       .Select(c => c.Value).SingleOrDefault();
                //}
            }

            return View();
        }

        [Authorize]
        public async Task<IActionResult> SellItems([FromBody] List<SellerItemsType> sellerItemsTypes)
        {
            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                int userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);
                sellerItemsTypes.ForEach(z => z.UserId = userId);
            }

            return Ok(await _sellRepository.SellItems(sellerItemsTypes, HttpContext.Session.GetString("TokenAuth")!));
        }
    }
}

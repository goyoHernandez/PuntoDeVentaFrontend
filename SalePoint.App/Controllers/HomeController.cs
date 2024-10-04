using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SalePoint.App.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private IWebHostEnvironment Environment;

        public HomeController(ILogger<HomeController> logger, IWebHostEnvironment environment)
        {
            _logger = logger;
            Environment = environment;
        }

        [Authorize]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult UploadLogo(IFormFile logo)
        {
            string path = Path.Combine(Environment.WebRootPath, "images\\logo");

            if (Directory.Exists(path))
                Directory.Delete(path, true);

            Directory.CreateDirectory(path);

            string fileName = Path.GetFileName($"Logo{Path.GetExtension(logo.FileName)}");

            using (FileStream stream = new(Path.Combine(path, fileName), FileMode.Create))
            {
                logo.CopyTo(stream);
            }

            return Json($"/images/logo/Logo{Path.GetExtension(logo.FileName)}");
        }

        [HttpGet]
        [Authorize]
        public IActionResult RefreshSession()
        {
            return Ok();
        }
    }
}
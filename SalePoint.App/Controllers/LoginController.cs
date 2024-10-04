using Microsoft.AspNetCore.Mvc;
using SalePoint.Primitives.Interfaces;
using SalePoint.Primitives;
using System.Dynamic;
using Newtonsoft.Json;
using SalePoint.App.Models;

namespace SalePoint.App.Controllers
{
    public class LoginController : Controller
    {
        private readonly IUserRepository _userRepository;
        private readonly IWebHostEnvironment Environment;

        public LoginController(IUserRepository userRepository, IWebHostEnvironment environment)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            Environment = environment;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Index([FromBody] Models.Access access)
        {
            try
            {
                ResponsePathLogo response = new();

                TokenAuth? tokenAuth = await _userRepository.Login(access);

                if (tokenAuth != null && !string.IsNullOrEmpty(tokenAuth.Token)) //&& tokenAuth.UserName != null)
                {
                    HttpContext.Session.SetString("TokenAuth", tokenAuth.Token);
                    response.Succesful = true;

                    string path = Path.Combine(Environment.WebRootPath, "images\\logo");

                    string? pathImage = Directory.GetFiles(path).FirstOrDefault();

                    response.PathLogo = pathImage != null ? $"/images/logo/{Path.GetFileName(pathImage)}" : "";
                 
                    return Json(response);
                }
                return Json(response.Succesful = false);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<IActionResult> LogOut()
        {
            //await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            HttpContext.Session.Clear();
            return Redirect("~/Login/Index");
        }
    }
}
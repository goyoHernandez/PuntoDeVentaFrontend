using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SalePoint.Primitives;
using SalePoint.Primitives.Interfaces;
using SalePoint.Repository;
using System.Security.Claims;

namespace SalePoint.App.Controllers
{

    public class CashRegisterController : Controller
    {
        private readonly ICashRegisterRepository _cashRegisterRepository;

        public CashRegisterController(ICashRegisterRepository cashRegisterRepository)
        {
            _cashRegisterRepository = cashRegisterRepository ?? throw new ArgumentNullException(nameof(cashRegisterRepository));
        }

        [Authorize]
        public IActionResult Index()
        {
            return View();
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllCashRegister()
        {
            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                int userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);
                return Ok(await _cashRegisterRepository.GetAllCashRegisterByUserId(userId, HttpContext.Session.GetString("TokenAuth")!));
            }
            return Json(null);
        }

        [Authorize]
        [HttpGet(Name = "boxCutId/{boxCutId}/cashFlowsType/{cashFlowsType}")]
        public async Task<IActionResult> GetCashFlowsDetail(int boxCutId, int cashFlowsType)
        {
            return Ok(await _cashRegisterRepository.GetCashFlowsDetail(boxCutId, cashFlowsType, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet(Name = "boxCutId/{boxCutId}")]
        public async Task<IActionResult> GetProductReturnsDetail(int boxCutId)
        {
            return Ok(await _cashRegisterRepository.GetProductReturnsDetail(boxCutId, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> ValidateOpenCashRegister()
        {
            CashRegister? cashRegisterOpen = new();

            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                int userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);

                IEnumerable<CashRegister>? cashRegisters = await _cashRegisterRepository.GetAllCashRegisterByUserId(userId, HttpContext.Session.GetString("TokenAuth")!);

                if (cashRegisters != null && cashRegisters.Any())
                {
                    cashRegisterOpen = cashRegisters.Where(cr => cr.BoxCloseReasonId == 1).FirstOrDefault();

                    if (cashRegisterOpen != null)
                    {
                        //Esta linea funciona cuando la fecha es devuelta en UTC
                        //DateTime cashRegisterDate = cashRegisterOpen.StartDate.ToLocalTime();
                        DateTime cashRegisterDate = cashRegisterOpen.StartDate;
                        DateTime dateTimeNow = DateTime.Now;

                        if (cashRegisterDate.Date < dateTimeNow.Date)
                            return Ok(true);
                        else
                            return Ok(0);

                    }
                }
                return Ok(false);
            }
            return Json(null);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> ValidateBoxCutOpen([FromBody] decimal change)
        {
            BoxCutOpen? boxCutOpen = new();

            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                int userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);

                boxCutOpen = await _cashRegisterRepository.ValidateBoxCutOpen(userId, change, HttpContext.Session.GetString("TokenAuth")!);
            }
            return Json(boxCutOpen);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> ApplyCashFlows([FromBody] CashFlows cashFlows)
        {
            return Json(await _cashRegisterRepository.ApplyCashFlows(cashFlows, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> OpenCashRegister([FromBody] decimal mount)
        {

            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                int userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);
                InitialAmount initialAmount = new()
                {
                    UserId = userId,
                    Mount = mount
                };

                return Json(await _cashRegisterRepository.OpenCashRegister(initialAmount, HttpContext.Session.GetString("TokenAuth")!));
            }
            return Json(0);
        }

        [Authorize]
        [HttpPut]
        public async Task<ActionResult> CloseCashRegister([FromBody] CashRegister cashRegister)
        {
            if (User.Identity is ClaimsIdentity claimsIdentity)
            {
                int userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);
                cashRegister.UserId = userId;

                return Json(await _cashRegisterRepository.CloseCashRegister(cashRegister, HttpContext.Session.GetString("TokenAuth")!));
            }
            return Json(0);
        }
    }
}

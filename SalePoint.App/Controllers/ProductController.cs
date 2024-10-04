using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SalePoint.Primitives;
using SalePoint.Primitives.Interfaces;
using System.Drawing.Printing;
using System.Security.Claims;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;

namespace SalePoint.App.Controllers
{
    public class ProductController : Controller
    {
        private readonly IProductRepository _productRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ProductController(IProductRepository productRepository, IDepartmentRepository departmentRepository, IWebHostEnvironment webHostEnvironment)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _departmentRepository = departmentRepository ?? throw new ArgumentNullException(nameof(departmentRepository));
            _webHostEnvironment = webHostEnvironment ?? throw new ArgumentException(nameof(webHostEnvironment));
        }

        [Authorize(Roles = "Administrador")]
        public IActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Administrador")]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            if (User.Identity is ClaimsIdentity claimsIdentity)
                product.UserId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);

            return Ok(await _productRepository.CreateProduct(product, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize(Roles = "Administrador")]
        [HttpPost]
        public async Task<IActionResult> SaveImageProduct([FromForm] int productId, IFormFile imageProduct)
        {
            // Verifica si se ha recibido una imagen
            if (imageProduct != null && imageProduct.Length > 0)
            {
                string[] allowedExtensions = [".jpg", ".jpeg", ".png"];
                string extension = Path.GetExtension(imageProduct.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                    return BadRequest("Formato de imagen no permitido.");
                string nameImage = $"{Guid.NewGuid()}{extension}";
                string folderProduct = productId == 0 ? Guid.NewGuid().ToString() : productId.ToString();
                string imageFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "products", folderProduct);
                string imageFullPath = Path.Combine(imageFolder, nameImage);

                // Verifica si la carpeta del producto existe
                if (Directory.Exists(imageFolder))
                    // Elimina la carpeta y su contenido
                    Directory.Delete(imageFolder, true);

                // Crea la carpeta nuevamente
                Directory.CreateDirectory(imageFolder);

                try
                {
                    // Guarda el archivo en el sistema
                    using var stream = new FileStream(imageFullPath, FileMode.Create);
                    await imageProduct.CopyToAsync(stream);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Error al guardar la imagen: {ex.Message}");
                }

                return Ok(new { imagePath = $"/images/products/{folderProduct}/{nameImage}", status = "Image saved successfully" });
            }
            return Ok("");
        }

        [Authorize]
        [HttpGet(Name = "pageNumber/{pageNumber}/pageSize/{pageSize}")]

        public async Task<IActionResult> GetAllProducts(int? pageNumber, int? pageSize, string? keyWord)
        {
            return Ok(await _productRepository.GetAllProducts(pageNumber, pageSize, keyWord, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet(Name = "totalPages/{totalPages}")]
        public async Task<IActionResult> DownloadInventory(int totalPages)
        {
            byte[] excelFile = await _generateExcelInventoryProducts(totalPages);

            // Devolver el archivo Excel como respuesta
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "InventarioProductos.xlsx");
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult> GetProductsExpiringSoon()
        {
            return Json(await _productRepository.GetProductsExpiringSoon(HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult> GetProductsNearCompletition()
        {
            return Json(await _productRepository.GetProductsNearCompletition(HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllDepartments()
        {
            return Ok(await _departmentRepository.GetAllDepartments(HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet(Name = "{productId}")]
        public async Task<IActionResult> GetProductById(int productId)
        {
            return Ok(await _productRepository.GetProductById(productId, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet(Name = "{barCode}")]
        public async Task<IActionResult> GetProductByBarCode(string barCode)
        {
            return Ok(await _productRepository.GetProductByBarCode(barCode, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet(Name = "{keyWord}")]
        public async Task<IActionResult> GetProductByNameOrDescription(string keyWord)
        {
            return Ok(await _productRepository.GetProductByNameOrDescription(keyWord, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize(Roles = "Administrador")]
        [HttpPut]
        public async Task<IActionResult> UpdateProduct([FromBody] Product product)
        {
            if (User.Identity is ClaimsIdentity claimsIdentity)
                product.UserId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);

            return Ok(await _productRepository.UpdateProduct(product, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize(Roles = "Administrador")]
        [HttpPut(Name = "productId/{productId}")]
        public async Task<IActionResult> UpdateStockProduct([FromBody] int stock, int productId)
        {
            return Ok(await _productRepository.UpdateStockProduct(stock, productId, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize(Roles = "Administrador")]
        [HttpDelete(Name = "{productId}")]
        public async Task<IActionResult> DeleteProduct(int productId)
        {
            int userId = 0;

            if (User.Identity is ClaimsIdentity claimsIdentity)
                userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);

            return Ok(await _productRepository.DeleteProduct(productId, userId, HttpContext.Session.GetString("TokenAuth")!));
        }

        [Authorize]
        [HttpGet(Name = "{keyWord}/pageNumber/{pageNumber}/pageSize/{pageSize}")]
        public async Task<IActionResult> GetProductByNameOrDescriptionPaginate(string keyWord, int pageNumber, int pageSize)
        {
            return Ok(await _productRepository.GetProductByNameOrDescriptionPaginate(keyWord, pageNumber, pageSize, HttpContext.Session.GetString("TokenAuth")!));
        }

        [HttpPut]
        public async Task<IActionResult> UpgradeBulkLoadProducts(IFormFile productsCsv)
        {
            if (productsCsv == null || productsCsv.Length == 0)
                return BadRequest("El archivo CSV no fue proporcionado o está vacío.");

            List<BulkUpgradeErrors> errors = [];

            BulkUpgradeErrors? bulkUpgradeErrors = await _productsCsvIsValid(productsCsv);

            if (bulkUpgradeErrors is not null)
                errors.Add(bulkUpgradeErrors);
            else
            {
                int userId = 0;

                if (User.Identity is ClaimsIdentity claimsIdentity)
                    userId = int.Parse(claimsIdentity.Claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault()!);

                errors = await _productRepository.UpgradeBulkLoadProducts(productsCsv, userId, HttpContext.Session.GetString("TokenAuth")!);
            }

            if (errors.Count > 0)
            {
                byte[] excelFile = await _generateExcelBulkUpgradeErrors(errors);

                // Devolver el archivo Excel como respuesta
                return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Productos_con_error.xlsx");
            }

            return Ok(new { success = true });
        }

        private async Task<byte[]> _generateExcelInventoryProducts(int totalPages)
        {
            try
            {
                if (totalPages > 0)
                {
                    using var workbook = new XLWorkbook();

                    for (int page = 1; page <= totalPages; page++)
                    {
                        // Obtener los productos para la página actual
                        IEnumerable<ResponseProduct>? products = (await _productRepository.GetAllProducts(page, 100, null, HttpContext.Session.GetString("TokenAuth")!))?.Products;

                        if (products is null || !products.Any())
                            continue;

                        // Crear un nuevo worksheet por cada página
                        var worksheet = workbook.Worksheets.Add($"Página {page}");

                        // Encabezados de las columnas
                        worksheet.Cell(1, 1).Value = "Id";
                        worksheet.Cell(1, 2).Value = "Nombre";
                        worksheet.Cell(1, 3).Value = "Codigo de barras";
                        worksheet.Cell(1, 4).Value = "Fecha de caducidad";
                        worksheet.Cell(1, 5).Value = "Descripcion";
                        //worksheet.Cell(1, 6).Value = "RouteImage";
                        worksheet.Cell(1, 6).Value = "Cantidad";
                        //worksheet.Cell(1, 8).Value = "MinimumStock";
                        worksheet.Cell(1, 7).Value = "Precio de compra";
                        //worksheet.Cell(1, 10).Value = "UnitMeasureId";
                        //worksheet.Cell(1, 11).Value = "CreationDate";
                        //worksheet.Cell(1, 12).Value = "UserId";
                        worksheet.Cell(1, 8).Value = "Precio de venta";
                        //worksheet.Cell(1, 14).Value = "PercentageProfit1";
                        //worksheet.Cell(1, 15).Value = "Revenue1";
                        //worksheet.Cell(1, 16).Value = "Wholesale1";
                        //worksheet.Cell(1, 9).Value = "SalesPrice2";
                        //worksheet.Cell(1, 18).Value = "PercentageProfit2";
                        //worksheet.Cell(1, 19).Value = "Revenue2";
                        //worksheet.Cell(1, 20).Value = "Wholesale2";
                        //worksheet.Cell(1, 21).Value = "DeparmentId";
                        //worksheet.Cell(1, 22).Value = "DeparmentName";
                        //worksheet.Cell(1, 23).Value = "MeasurementUnitName";
                        //worksheet.Cell(1, 24).Value = "Icon";

                        // Añadir los datos de los productos
                        int row = 2;
                        foreach (var product in products)
                        {
                            worksheet.Cell(row, 1).Value = product.ProductId;
                            worksheet.Cell(row, 2).Value = product.NameProduct;
                            worksheet.Cell(row, 3).Value = product.BarCode;
                            worksheet.Cell(row, 4).Value = product.ExpirationDate?.ToString("yyyy-MM-dd");
                            worksheet.Cell(row, 5).Value = product.Description;
                            //worksheet.Cell(row, 6).Value = product.RouteImage;
                            worksheet.Cell(row, 6).Value = product.Stock;
                            //worksheet.Cell(row, 8).Value = product.MinimumStock;
                            worksheet.Cell(row, 7).Value = product.PurchasePrice;
                            //worksheet.Cell(row, 10).Value = product.UnitMeasureId;
                            //worksheet.Cell(row, 11).Value = product.CreationDate.ToString("yyyy-MM-dd");
                            //worksheet.Cell(row, 12).Value = product.UserId;
                            worksheet.Cell(row, 8).Value = product.SalesPrice1;
                            //worksheet.Cell(row, 14).Value = product.PercentageProfit1;
                            //worksheet.Cell(row, 15).Value = product.Revenue1;
                            //worksheet.Cell(row, 16).Value = product.Wholesale1;
                            //worksheet.Cell(row, 9).Value = product.SalesPrice2;
                            //worksheet.Cell(row, 18).Value = product.PercentageProfit2;
                            //worksheet.Cell(row, 19).Value = product.Revenue2;
                            //worksheet.Cell(row, 20).Value = product.Wholesale2;
                            //worksheet.Cell(row, 21).Value = product.DeparmentId;
                            //worksheet.Cell(row, 22).Value = product.DeparmentName;
                            //worksheet.Cell(row, 23).Value = product.MeasurementUnitName;
                            //worksheet.Cell(row, 24).Value = product.Icon;
                            row++;
                        }

                        // Ajustar el ancho de las columnas automáticamente
                        worksheet.Columns().AdjustToContents();
                    }

                    using var stream = new MemoryStream();
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();

                    // Devolver el archivo como descargable
                    return content;
                }

                return [];
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private async Task<byte[]> _generateExcelBulkUpgradeErrors(List<BulkUpgradeErrors> errors)
        {
            try
            {
                using var workbook = new XLWorkbook();

                // Crear un nuevo worksheet por cada página
                IXLWorksheet worksheet = workbook.Worksheets.Add("Productos");

                // Encabezados de las columnas
                worksheet.Cell(1, 1).Value = "Fila";
                worksheet.Cell(1, 2).Value = "Columna";
                worksheet.Cell(1, 3).Value = "Error";

                // Añadir los datos de los productos
                int row = 2;
                foreach (BulkUpgradeErrors error in errors)
                {
                    worksheet.Cell(row, 1).Value = error.Row;
                    worksheet.Cell(row, 2).Value = error.Column;
                    worksheet.Cell(row, 3).Value = error.Error;
                    row++;
                }

                // Ajustar el ancho de las columnas automáticamente
                worksheet.Columns().AdjustToContents();

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                byte[] content = stream.ToArray();

                // Devolver el archivo como descargable
                return content;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private async Task<BulkUpgradeErrors?> _productsCsvIsValid(IFormFile productsCsv)
        {
            List<string> expectedHeaders = ["ProductId", "Name", "ExpirationDate", "Description", "Stock", "PurchasePrice", "UserId", "RetailSalePrice", "WholeSalePrice", "WholeSaleQuantity"];

            using var stream = new StreamReader(productsCsv.OpenReadStream());

            // Leer la primera línea (los encabezados)
            string? headerLine = await stream.ReadLineAsync();
            if (headerLine is null)
            {
                return new BulkUpgradeErrors
                {
                    Row = 1,
                    Column = "Todas",
                    Error = "El archivo CSV está vacío."
                };
            }

            // Separar los encabezados por comas (o el delimitador que uses)
            string[]? headers = headerLine.Split(',');

            // Validar si los encabezados coinciden con los esperados
            if (!expectedHeaders.SequenceEqual(headers))
            {
                return new BulkUpgradeErrors
                {
                    Row = 1,
                    Column = "Todas",
                    Error = "Los encabezados del archivo CSV no coinciden con los esperados.",
                };
            }

            // Si todo es válido, devuelve null o continúa con el procesamiento
            return null;
        }
    }
}
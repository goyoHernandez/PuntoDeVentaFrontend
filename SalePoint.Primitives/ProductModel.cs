namespace SalePoint.Primitives
{
#nullable disable
    public record ProductModel
    {
        public Filters Filters { get; set; } = new();

        public IEnumerable<ResponseProduct> Products { get; set; } = Enumerable.Empty<ResponseProduct>();
    }

    public record Filters
    {
        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPage { get; set; }
    }

    public record ResponseProduct
    {
        public int ProductId { get; set; }

        public string NameProduct { get; set; } = string.Empty;

        public string BarCode { get; set; } = string.Empty;

        public DateTime? ExpirationDate { get; set; }

        public string Description { get; set; } = string.Empty;

        public string? RouteImage { get; set; }

        public decimal Stock { get; set; }

        public decimal MinimumStock { get; set; }

        public decimal PurchasePrice { get; set; }

        public byte[]? Thumbnail { get; set; }

        public string? ThumbnailBase64
        {
            get
            {
                return Thumbnail is not null ? Convert.ToBase64String(Thumbnail) : null;
            }
        }

        public int UnitMeasureId { get; set; }

        public DateTime CreationDate { get; set; }

        public int UserId { get; set; }

        public decimal SalesPrice1 { get; set; }

        public decimal PercentageProfit1 { get; set; }

        public decimal Revenue1 { get; set; }

        public decimal Wholesale1 { get; set; }

        public decimal? SalesPrice2 { get; set; }

        public decimal? PercentageProfit2 { get; set; }

        public decimal? Revenue2 { get; set; }

        public decimal? Wholesale2 { get; set; }

        public int DeparmentId { get; set; }

        public string DeparmentName { get; set; } = string.Empty;

        public string MeasurementUnitName { get; set; } = string.Empty;

        public string Icon { get; set; } = string.Empty;
    }
}
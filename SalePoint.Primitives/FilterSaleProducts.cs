namespace SalePoint.Primitives
{
    public record FilterSaleProducts
    {
        public int UserId { get; set; }

        public string? SaleDateStart { get; set; }

        public string? SaleDateEnd { get; set; }
    }
}
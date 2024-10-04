#nullable disable
namespace SalePoint.Primitives
{
    public record Sale
    {
        public int SaleId { get; set; }

        public int BoxCutId { get; set; }

        public int ProductId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public decimal Quantity { get; set; }

        public decimal PurchasePrice { get; set; }

        public decimal RetailPrice { get; set; }

        public decimal RetailGain { get; set; }

        public decimal WholesalePrice { get; set; }

        public decimal WholesaleGain { get; set; }

        public decimal Wholesale { get; set; }

        public decimal Revenue { get; set; }

        public int UnitMeasureId { get; set; }

        public string? UnitMeasure { get; set; }

        public DateTime SaleDate { get; set; }

        public DateTime ReturnDate { get; set; }

        public int UserId { get; set; }

        public string User { get; set; }

        public string? UserAppliesReturn { get; set; }

        public int? BoxCutProductReturnId { get; set; }

    }
}
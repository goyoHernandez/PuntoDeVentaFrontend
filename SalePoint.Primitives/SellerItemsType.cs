namespace SalePoint.Primitives
{
    public record SellerItemsType
    {
        public int? BoxCutId { get; set; }

        public int ProductId { get; set; }

        public int UserId { get; set; }

        public decimal Quantity { get; set; }

        public decimal PurchasePrice { get; set; }

        public decimal RetailPrice { get; set; }

        public decimal RetailGain { get; set; }

        public decimal WholesalePrice { get; set; }

        public decimal WholesaleGain { get; set; }

        public decimal Wholesale { get; set; }

        public decimal Amount { get; set; }

        public int UnitMeasureId { get; set; }
    }
}
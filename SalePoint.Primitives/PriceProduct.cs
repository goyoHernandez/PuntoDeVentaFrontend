namespace SalePoint.Primitives
{
    public record PriceProduct
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public decimal SalesPrice { get; set; }

        public decimal PercentageProfit { get; set; }

        public decimal Revenue { get; set; }

        public int Wholesale { get; set; }
    }
}

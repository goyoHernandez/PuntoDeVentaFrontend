#nullable disable
namespace SalePoint.Primitives
{
    public record CashFlows
    {
        public int Id { get; set; }

        public int BoxCutId { get; set; }

        public int CashFlowsTypesId { get; set; }

        public decimal Quantity { get; set; }

        public string Reason { get; set; }

        public DateTime CreateDate { get; set; }

        public DateTime DeletionDate { get; set; }
    }
}

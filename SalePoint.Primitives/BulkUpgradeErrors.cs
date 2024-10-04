namespace SalePoint.Primitives
{
    public class BulkUpgradeErrors
    {
        public int Id { get; set; }

        public int Row { get; set; }

        public string Column { get; set; } = string.Empty;

        public string Error { get; set; } = string.Empty;

        public int BulkUpgradeId { get; set; }

        public int UserId { get; set; }

        public DateTime CreateDate { get; set; }
    }
}
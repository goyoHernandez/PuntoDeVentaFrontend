namespace SalePoint.Primitives
{
#nullable disable
    public record BoxCutOpen
    {
        public int BoxCutId { get; set; }

        public decimal Change { get; set; }

        public bool BoxOpen { get; set; }

        public string StatusMessage { get; set; }
    }
}
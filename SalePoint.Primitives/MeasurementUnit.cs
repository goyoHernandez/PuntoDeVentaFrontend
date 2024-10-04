namespace SalePoint.Primitives
{
#nullable disable
    public record MeasurementUnit
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Icon { get; set; }

        public DateTime? CreationDate { get; set; }

        public DateTime? ModificationDate { get; set; }

        public DateTime? DeletionDate { get; set; }

        public bool IsActive { get; set; }
    }
}
namespace SalePoint.Primitives
{
    public record Product
    {
        public int Id { get; set; }

        public string? Name { get; set; }

        public string? BarCode { get; set; }

        public DateTime? ExpirationDate { get; set; }

        public string? Description { get; set; }

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
            set
            {
                if (!string.IsNullOrEmpty(value))
                {
                    // Convertir la cadena Base64 en un array de bytes
                    Thumbnail = Convert.FromBase64String(value);
                }
                else
                {
                    Thumbnail = null;
                }
            }
        }

        public string? RouteImage { get; set; }

        public int UnitMeasureId { get; set; }

        public bool IsActive { get; set; }

        public DateTime? CreationDate { get; set; }

        public DateTime? ModificationDate { get; set; }

        public DateTime? DeletionDate { get; set; }

        public int UserId { get; set; }

        public Department? Department { get; set; }

        public ProductDepartment? ProductDepartment { get; set; }
        public MeasurementUnit? MeasurementUnit { get; set; }

        public List<PriceProduct>? PriceProducts { get; set; }

        public Product()
        {
            PriceProducts = new List<PriceProduct>();
        }
    }
}
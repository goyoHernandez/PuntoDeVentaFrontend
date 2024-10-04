namespace SalePoint.Primitives
{
    public record ProductDepartment
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public int DepartmentId { get; set; }
    }
}

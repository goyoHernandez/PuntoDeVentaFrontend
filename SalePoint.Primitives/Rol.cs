using System;

namespace SalePoint.Primitives
{
#nullable disable
    public record Rol
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreationDate { get; set; }

        public DateTime ModificationDate { get; set; }

        public DateTime? DeletionDate { get; set; }
    }
}
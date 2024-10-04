#nullable disable
namespace SalePoint.Primitives
{
    public record StoreUser
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string LastName { get; set; }

        public int Age { get; set; }

        public string Address { get; set; }

        public string CellPhone { get; set; }

        public byte? Avatar { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreationDate { get; set; }

        public DateTime ModificationDate { get; set; }

        public DateTime? DeletionDate { get; set; }

        public int RolId { get; set; }

        public string UserName { get; set; }

        public string Pass { get; set; }

        public Rol Rol { get; set; }
    }
}

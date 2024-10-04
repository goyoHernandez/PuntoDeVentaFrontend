namespace SalePoint.Primitives.Interfaces
{
    public interface IUserRepository
    {
        Task<TokenAuth?> Login(Access access);

        Task<List<Rol>?> GetRols(string token);

        Task<int> CreateUser(StoreUser storeUser, string token);

        Task<IEnumerable<StoreUser>?> GetAllUsers(string token);

        Task<StoreUser?> GetUserById(int userId, string token);

        Task<int> UpdateUser(StoreUser storeUser, string token);

        Task<int> DeleteUserById(int userId, string token);
    }
}
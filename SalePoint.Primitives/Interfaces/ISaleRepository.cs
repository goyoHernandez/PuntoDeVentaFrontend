namespace SalePoint.Primitives.Interfaces
{
    public interface ISaleRepository
    {
        Task<List<Sale>> GetSalesByUserId(FilterSaleProducts filterSaleProducts, string token);

        Task<int> ReturnProduct(ProductReturns productReturns, string token);
    }
}
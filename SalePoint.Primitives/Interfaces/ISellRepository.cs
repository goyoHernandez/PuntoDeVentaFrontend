namespace SalePoint.Primitives.Interfaces
{
    public interface ISellRepository
    {
        Task<int> SellItems(List<SellerItemsType> sellerItemsTypes, string token);

    }
}
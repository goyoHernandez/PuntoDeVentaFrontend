namespace SalePoint.Primitives.Interfaces
{
    public interface ICatalogRepository
    {
        Task<IEnumerable<MeasurementUnit>?> GetMeasurementUnit(string token);
    }
}

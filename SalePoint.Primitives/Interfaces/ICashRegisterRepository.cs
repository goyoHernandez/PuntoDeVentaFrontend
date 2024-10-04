namespace SalePoint.Primitives.Interfaces
{
    public interface ICashRegisterRepository
    {
        Task<IEnumerable<CashRegister>?> GetAllCashRegisterByUserId(int? userId, string token);

        Task<IEnumerable<CashFlows>?> GetCashFlowsDetail(int boxCutId, int cashFlowsType, string token);

        Task<IEnumerable<Sale>?> GetProductReturnsDetail(int boxCutId, string token);

        Task<int> OpenCashRegister(InitialAmount initialAmount, string token);

        Task<int> CloseCashRegister(CashRegister cashRegister, string token);

        Task<int> ApplyCashFlows(CashFlows cashFlows, string token);

        Task<BoxCutOpen?> ValidateBoxCutOpen(int userId, decimal change, string token);
    }
}
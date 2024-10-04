namespace SalePoint.Primitives
{
    public record CashRegister
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int BoxCloseReasonId { get; set; }

        public decimal InitialAmount { get; set; }

        public decimal FinalAmount { get; set; }

        public decimal Gain { get; set; }

        public decimal? CashIncome { get; set; }

        public decimal? CashWithdrawal { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int NumberReimbursement { get; set; }

        public StoreUser? StoreUser { get; set; }

        public BoxCloseReason? BoxCloseReason { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SalePoint.Primitives
{
    public record InitialAmount
    {
        public int UserId { get; set; }

        public decimal Mount { get; set; }
    }
}

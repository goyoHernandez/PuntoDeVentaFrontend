using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SalePoint.Primitives.Interfaces
{
    public interface IDepartmentRepository
    {
        Task<IEnumerable<Department>?> GetAllDepartments(string token);
    }
}

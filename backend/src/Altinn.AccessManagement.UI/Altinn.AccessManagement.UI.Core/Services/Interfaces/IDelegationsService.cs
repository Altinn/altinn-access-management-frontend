using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.AccessControl;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for delegations
    /// </summary>
    public interface IDelegationsService
    {
        /// <summary>
        /// Gets all the resources delegated by the reportee
        /// </summary>
        /// <param name="party">reportee that delegated resources</param>
        /// <returns>list of delgations</returns>
        public Task<List<DelegationsFE>> GetAllOutboundDelegationsAsync(string party);

        /// <summary>
        /// Gets all the delegations received by a reportee
        /// </summary>
        /// <param name="party">reportee that delegated resources</param>
        /// <returns>list of delgations</returns>
        public Task<List<DelegationsFE>> GetAllInboundDelegationsAsync(string party);
    }
}

using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;

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

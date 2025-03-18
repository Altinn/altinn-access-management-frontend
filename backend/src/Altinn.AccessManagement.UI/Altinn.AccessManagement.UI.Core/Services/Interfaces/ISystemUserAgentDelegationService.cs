using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// The "middleware" between the BFF's SystemUserAPI and Altinn's real SystemUserAPI in the Authentication Component
    /// </summary>
    public interface ISystemUserAgentDelegationService
    {
        /// <summary>
        /// Return all customers of a specific type for party
        /// </summary>
        /// <param name="partyUuid">The party UUID of the party to retrieve customers from</param>
        /// <param name="customerType">Customer type to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all party customers</returns>
        Task<Result<List<AgentDelegationPartyFE>>> GetPartyCustomers(Guid partyUuid, CustomerRoleType customerType, CancellationToken cancellationToken);
    }
}
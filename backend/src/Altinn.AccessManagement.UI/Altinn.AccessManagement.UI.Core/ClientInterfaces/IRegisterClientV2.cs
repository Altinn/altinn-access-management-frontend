using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Register;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with the platform register API
    /// </summary>
    public interface IRegisterClientV2
    {
        /// <summary>
        /// Return all customers of a specific type for party
        /// </summary>
        /// <param name="partyUuid">The party UUID of the party to retrieve customers from</param>
        /// <param name="customerType">Customer type to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all party customers</returns>
        Task<CustomerList> GetPartyCustomers(Guid partyUuid, CustomerRoleType customerType, CancellationToken cancellationToken);
    }
}
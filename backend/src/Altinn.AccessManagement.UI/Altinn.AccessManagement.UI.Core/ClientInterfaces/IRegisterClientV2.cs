using Altinn.AccessManagement.UI.Core.Models.Register;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with the platform register API
    /// </summary>
    public interface IRegisterClientV2
    {
        Task<CustomerList> GetPartyRegnskapsforerCustomers(Guid partyUuid, CancellationToken cancellationToken);

        Task<CustomerList> GetPartyRevisorCustomers(Guid partyUuid, CancellationToken cancellationToken);
    }
}
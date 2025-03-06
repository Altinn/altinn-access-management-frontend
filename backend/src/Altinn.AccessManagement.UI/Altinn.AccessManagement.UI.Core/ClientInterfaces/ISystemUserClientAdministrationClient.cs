using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with the platform register API
    /// </summary>
    public interface ISystemUserClientAdministrationClient
    {
        Task<List<string>> GetSystemUserClientDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken);

        Task<Result<bool>> AddClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken);

        Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken);
    }
}
using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Provides operations against the bankruptcy estate endpoints in Access Management.
    /// </summary>
    public interface IBankruptcyEstateClient
    {
        /// <summary>
        /// Determines whether the specified party has any bankruptcy estates.
        /// </summary>
        /// <param name="partyId">The unique identifier of the party to evaluate.</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>A task that represents the asynchronous operation. The task result is <see langword="true"/> if the party has any bankruptcy estates; otherwise, <see langword="false"/>.</returns>
        Task<bool> HasAnyEstates(Guid partyId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the administrators of the bankruptcy estates of the specified party.
        /// </summary>
        /// <param name="partyId">The party uuid of the bankruptcy estate administrator (bostyrer).</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>A task that represents the asynchronous operation. The task result is the administrators with the estates they have access to.</returns>
        Task<IEnumerable<BankruptcyEstateAdministrator>> GetAdministrators(Guid partyId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds a person as administrator of the bankruptcy estates of the specified party.
        /// </summary>
        /// <param name="partyId">The party uuid of the bankruptcy estate administrator (bostyrer).</param>
        /// <param name="personInput">The person identifier and last name of the person to add.</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>A task that represents the asynchronous operation. The task result is the created assignment.</returns>
        Task<AssignmentDto> AddAdministrator(Guid partyId, PersonInput personInput, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes an administrator of the bankruptcy estates of the specified party.
        /// </summary>
        /// <param name="partyId">The party uuid of the bankruptcy estate administrator (bostyrer).</param>
        /// <param name="user">The party uuid of the administrator to remove.</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task RemoveAdministrator(Guid partyId, Guid user, CancellationToken cancellationToken = default);
    }
}

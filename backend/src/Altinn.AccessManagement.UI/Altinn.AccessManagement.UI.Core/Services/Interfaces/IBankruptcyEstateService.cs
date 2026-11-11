using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Provides operations for evaluating administrative access to bankruptcy estate functionality.
    /// </summary>
    public interface IBankruptcyEstateService
    {
        /// <summary>
        /// Determines whether the authenticated user should see bankruptcy estate administration
        /// when acting on behalf of the given party. Until Access Management offers a dedicated
        /// access check, this is true when the party has at least one bankruptcy estate and the
        /// user may read them, and false when the API answers 403.
        /// </summary>
        /// <param name="partyId">The party the user is acting on behalf of.</param>
        /// <param name="cancellationToken">A token used to cancel the asynchronous operation.</param>
        /// <returns><see langword="true"/> when the user should see bankruptcy estate administration for the party; otherwise <see langword="false"/>.</returns>
        Task<bool> IsBankruptcyEstateAdmin(Guid partyId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets the administrators of the bankruptcy estates of the given party.
        /// </summary>
        /// <param name="partyId">The party the user is acting on behalf of.</param>
        /// <param name="cancellationToken">A token used to cancel the asynchronous operation.</param>
        /// <returns>The administrators with the estates they have access to, mapped for the frontend.</returns>
        Task<IEnumerable<BankruptcyEstateAdministratorFE>> GetAdministrators(Guid partyId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds a person as administrator of the bankruptcy estates of the given party.
        /// </summary>
        /// <param name="partyId">The party the user is acting on behalf of.</param>
        /// <param name="personInput">The person identifier and last name of the person to add.</param>
        /// <param name="cancellationToken">A token used to cancel the asynchronous operation.</param>
        /// <returns>The created assignment, or a validation problem when the person input is missing, malformed or rejected by Access Management.</returns>
        Task<Result<AssignmentDto>> AddAdministrator(Guid partyId, PersonInput personInput, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes an administrator of the bankruptcy estates of the given party.
        /// </summary>
        /// <param name="partyId">The party the user is acting on behalf of.</param>
        /// <param name="user">The party uuid of the administrator to remove.</param>
        /// <param name="cancellationToken">A token used to cancel the asynchronous operation.</param>
        Task RemoveAdministrator(Guid partyId, Guid user, CancellationToken cancellationToken = default);
    }
}

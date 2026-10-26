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
        Task<bool> HasBankruptcyEstateAdminAccess(Guid partyId, CancellationToken cancellationToken = default);
    }
}

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with access package metadata
    /// </summary>
    public interface IRightHolderClient
    {
        /// <summary>
        /// Creates an assignment between the authenticated user's selected party and the specified target party.
        /// </summary>
        /// <param name="party">The GUID identifying the party the authenticated user is acting on behalf of.</param>
        /// <param name="to">The GUID identifying the target party to which the assignment should be created.</param>
        /// <param name="cancellationToken"><see cref="CancellationToken"/></param>
        Task<HttpResponseMessage> PostNewRightHolder(Guid party, Guid to, CancellationToken cancellationToken = default);
    }
}

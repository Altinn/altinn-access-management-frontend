using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Resolves which system users have rights fixed by the vendor
    /// </summary>
    public interface ISystemUserRightsResolver
    {
        /// <summary>
        /// Looks up the system users among the given parties and sets <see cref="PartyFE.IsVendorFixedRights"/> on the standard ones.
        /// </summary>
        /// <param name="actingPartyUuid">The party acting, which owns the system users</param>
        /// <param name="parties">The parties to resolve. Non-system users are left untouched.</param>
        /// <param name="cancellationToken">Cancellation token</param>
        Task ApplyVendorFixedRights(Guid actingPartyUuid, IEnumerable<PartyFE> parties, CancellationToken cancellationToken = default);
    }
}

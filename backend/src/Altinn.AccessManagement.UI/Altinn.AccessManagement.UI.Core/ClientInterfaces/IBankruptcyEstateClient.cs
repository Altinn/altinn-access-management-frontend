using System;
using System.Collections.Generic;
using System.Text;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Provides operations for determining whether a party is a bankruptcy estate administrator.
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
    }
}

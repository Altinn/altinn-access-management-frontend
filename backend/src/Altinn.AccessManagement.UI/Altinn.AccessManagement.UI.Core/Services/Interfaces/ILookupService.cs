﻿using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for lookup
    /// </summary>
    public interface ILookupService
    {
        /// <summary>
        /// Looks up party information for an organization based on the organization number
        /// </summary>
        /// <param name="organizationNumber">The organization number</param>
        /// <returns>
        /// Party information
        /// </returns>
        Task<Party> GetPartyForOrganization(string organizationNumber);

        /// <summary>
        /// Gets a Party based on provided uuid
        /// </summary>
        /// <param name="uuid">The uuid of the party</param>
        /// <returns>Party that corresponds to uuid parameter</returns>
        Task<Party> GetPartyByUUID(Guid uuid);

        /// <summary>
        /// Gets a UserProfile based on provided uuid
        /// </summary>
        /// <param name="uuid">The uuid of the user</param>
        /// <returns>The user profile that corresponds to the uuid parameter</returns>
        Task<UserProfile> GetUserByUUID(Guid uuid);
    }
}

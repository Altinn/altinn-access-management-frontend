﻿using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for delegations
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Gets the user's preferences from altinn profile
        /// </summary>
        /// <param name="userId">Id of user</param>
        /// <returns>users preferred settings</returns>
        Task<UserProfileFE> GetUserProfile(int userId);

        /// <summary>
        /// Gets a Party based on partyId if the party is in the users reporteelist
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <returns>Party that corresponds to partyId parameter if it's in the users reporteelist</returns>
        Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId);

        /// <summary>
        /// Gets the right holders of a given reportee
        /// </summary>
        /// <param name="partyId">The party Id of the reportee</param>
        /// <returns>List of right holders</returns>
        Task<List<RightHolder>> GetReporteeRightHolders(int partyId);

        /// <summary>
        /// Gets a list of all reportees for a given party
        /// </summary>
        /// <param name="partyUuid">The id of the party</param>
        Task<List<Reportee>> GetReporteeList(Guid partyUuid);

        /// <summary>
        /// Gets all accesses of a given right holder for a reportee
        /// </summary>
        /// <param name = "reporteeUuid" > The uuid for the reportee which the right holder has access to</param>
        /// <param name="rightHolderUuid">The uuid for the right holder whose accesses are to be returned</param>
        /// <returns>All right holder's accesses</returns>
        Task<RightHolderAccesses> GetRightHolderAccesses(string reporteeUuid, string rightHolderUuid);

        /// <summary>
        /// Checks that a person with the provided ssn and lastname exists. If they do, the person's partyUuid is returned.
        /// </summary>
        /// <param name="ssn">The ssn of the user</param>
        /// <param name="lastname">The last name of the user</param>
        /// <returns>The person's partyUuid if ssn and lastname correspond to the same person. Returns null if matching person is not found</returns>
        Task<Guid?> ValidatePerson(string ssn, string lastname);
    }
}

using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for a client wrapper for integration with SBL bridge delegation request API
    /// </summary>
    public interface ILookupClient
    {
        /// <summary>
        /// Looks up a party based on OrgNumber.
        /// </summary>
        /// <param name="organisationNumber">organisation number</param>
        /// <returns>
        /// The party that represents the given OrgNumber.
        /// </returns>
        Task<Party> GetOrganisation(string organisationNumber);

        /// <summary>
        /// Retreive party if party exists in the authenticated users reporteelist
        /// </summary>
        /// <param name="partyId">party id</param>
        /// <returns></returns>
        Task<Party> GetPartyFromReporteeListIfExists(int partyId);
    }
}

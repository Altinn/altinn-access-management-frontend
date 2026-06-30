using Altinn.AccessManagement.UI.Core.Models.AccessManagement;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
        /// <summary>
        ///     Interface for client to integrate with access management
        /// </summary>
        public interface IAccessManagementClientV0
        {
                /// <summary>
                /// Gets a list of reportees a user can act on behalf of
                /// </summary>
                /// <returns>list of reportees</returns>
                Task<List<AuthorizedParty>> GetReporteeListForUser();

                /// <summary>
                /// Retrieve party if party exists in the authenticated users reporteelist
                /// </summary>
                /// <param name="partyUuid">party uuid</param>
                /// <returns></returns>
                Task<AuthorizedParty> GetPartyFromReporteeListIfExists(Guid partyUuid);
        }
}

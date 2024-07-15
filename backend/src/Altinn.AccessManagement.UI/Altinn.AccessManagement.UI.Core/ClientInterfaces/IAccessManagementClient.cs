using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    ///     Interface for client to integrate with maskinporten schema delegations API in platform
    /// </summary>
    public interface IAccessManagementClient
    {
        /// <summary>
        /// Retreive party if party exists in the authenticated users reporteelist
        /// </summary>
        /// <param name="partyId">party id</param>
        /// <returns></returns>
        Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId);

        /// <summary>
        /// Gets the right holders of a given reportee
        /// </summary>
        /// <param name="partyId">The party Id of the reportee</param>
        /// <returns>List of parties holding rights for the partyId</returns>
        Task<List<AuthorizedParty>> GetReporteeRightHolders(int partyId);

        /// <summary>
        ///     Clears cached accesses of the delegation recipient
        /// </summary>
        /// <param name="party">
        ///     The party from which the rights have been given (delegator)
        /// </param>
        /// <param name="recipient">
        ///     The uuid identifier of the recipient (delegation recipient) to clear access cache on
        ///     Example: 
        ///     {
        ///     "type": "urn:altinn:person:uuid",
        ///     "value": "00000000-0000-0000-0000-000000000000"
        ///     }
        /// </param>
        /// <returns></returns>
        Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient);

        //// MaskinportenSchema

        /// <summary>
        ///     Gets the delegations received by the party
        /// </summary>
        /// <returns>list of delegations</returns>
        Task<List<MaskinportenSchemaDelegation>> GetReceivedMaskinportenSchemaDelegations(string party);

        /// <summary>
        ///     Gets the delegations offered by the party
        /// </summary>
        /// <returns>list of delegations</returns>
        Task<List<MaskinportenSchemaDelegation>> GetOfferedMaskinportenSchemaDelegations(string party);

        /// <summary>
        ///     Revokes received delegation
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation);

        /// <summary>
        ///     Revokes Offered delegation
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegation delegation);

        /// <summary>
        ///     Creates a maskinporten delegation
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation);
        
        /// <summary>
        /// Endpoint for performing a check if the user can delegate a maskinporten schema service to a specified reportee.
        /// </summary>
        /// <param name="partyId">The reportee's party id</param>
        /// <param name="request">Necessary info about the right that's going to be checked</param>
        Task<List<DelegationResponseData>> MaskinportenSchemaDelegationCheck(string partyId, Right request);

        //// Single Rights

        /// <summary>
        ///     Checks whether the user can delegate the given right to the given party
        /// </summary>
        /// <param name="partyId">
        ///     Used to identify the party the authenticated user is acting on behalf of.
        /// </param>
        /// <param name="request">
        ///     The delegation access check request object that's going to be consumed by the backend
        /// </param>
        /// <returns>HttpResponseMessage: The response from backend /></returns>
        Task<HttpResponseMessage> CheckSingleRightsDelegationAccess(string partyId, Right request);

        /// <summary>
        ///     Creates a single rights delegation
        /// </summary>
        /// <param name="party">
        ///     The party from which to delegate the right
        /// </param>
        /// <param name="delegation">
        ///     The delegation to be created
        /// </param>
        /// <returns></returns>
        Task<HttpResponseMessage> CreateSingleRightsDelegation(string party, DelegationInput delegation);
    }
}

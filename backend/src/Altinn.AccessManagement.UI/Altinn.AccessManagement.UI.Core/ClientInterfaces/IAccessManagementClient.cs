using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    ///     Interface for client to integrate with access management
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
        /// Gets all accesses of a given right holder for a reportee
        /// </summary>
        /// <param name = "reporteeUuid" > The uuid for the reportee which the right holder has access to</param>
        /// <param name="rightHolderUuid">The uuid for the right holder whose accesses are to be returned</param>
        /// <returns>All right holder's accesses</returns>
        Task<RightHolderAccesses> GetRightHolderAccesses(string reporteeUuid, string rightHolderUuid);

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

        /// <summary>
        ///     Retrieves the single rights for a specific right holder.
        /// </summary>
        /// <param name="party">The party identifier.</param>
        /// <param name="userId">The user identifier.</param>
        /// <returns></returns>
        Task<HttpResponseMessage> GetSingleRightsForRightholder(string party, string userId);

        /// <summary>
        /// Revokes all rights on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted. Provided on urn format</param>
        /// <param name="to">The right holder that has been granted access to the resource. Provided on urn format</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeResourceDelegation(string from, string to, string resourceId);

        /// <summary>
        /// Revokes a single right on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted. Provided on urn format</param>
        /// <param name="to">The right holder that has been granted access to the resource. Provided on urn format</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <param name="rightKey">The identifier of the right that is to be revoked</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeRightDelegation(string from, string to, string resourceId, string rightKey);

        /// <summary>
        /// Revokes a single right on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted. Provided on urn format</param>
        /// <param name="to">The right holder that has been granted access to the resource. Provided on urn format</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <param name="rightKeys">List of identifiers for the rights to be delegated</param>
        /// <returns></returns>
        Task<HttpResponseMessage> DelegateResourceRights(string from, string to, string resourceId, List<string> rightKeys);

        //// Access packages

        /// <summary>
        ///     Gets all access package delegations from someone to someone (or multiple someones)
        /// </summary>
        /// <param name="to">the one(s) who has received the delegated access. Can be either a guid or one of the following strigns: "all", "me"</param>
        /// <param name="from">The the one(s) whose rights have been delegated to the one(s) specified in to. Can be either a guid or one of the following strigns: "all", "me"</param>
        /// <param name="languageCode">The code of the language on which texts are to be returned</param>
        /// <returns>A list of all access package delegations</returns>
        Task<List<AccessPackageAccess>> GetAccessPackageAccesses(string to, string from, string languageCode);

        /// <summary>
        ///     Revokes access to a given package for a right holder (to) on behalf of a party (from)
        /// </summary>
        /// <param name="from">The party which has granted access to the package to the right holder</param>
        /// <param name="to">The right holder which currently has access to the access package</param>
        /// <param name="packageId">The access package which the right holder is to lose access to on behalf of the given party (from)</param>
        /// <returns>A HttpResponseMessage denoting whether or not the action was successfull.</returns>
        Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, string packageId);
    }
}

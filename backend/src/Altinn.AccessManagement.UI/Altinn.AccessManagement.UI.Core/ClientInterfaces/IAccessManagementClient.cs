using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    ///     Interface for client to integrate with access management
    /// </summary>
    public interface IAccessManagementClient
    {
        /// <summary>
        /// Retrieve party if party exists in the authenticated users reporteelist
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
        /// Gets a list of all reportees for a given party
        /// </summary>
        /// <param name="partyId">The id of the party</param>
        Task<List<AuthorizedParty>> GetReporteeList(Guid partyId);

        /// <summary>
        /// Gets all accesses of a given right holder for a reportee
        /// </summary>
        /// <param name = "from" > The uuid for the reportee which the right holder has access to</param>
        /// <param name="to">The uuid for the right holder whose accesses are to be returned</param>
        /// <returns>All right holder's accesses</returns>
        Task<UserAccesses> GetUserAccesses(Guid from, Guid to);

        //// Single Rights

        /// <summary>
        ///    Fetches all rights on a given resource with details on whether they can be delegated on behalf of the party
        /// </summary>
        /// <param name="party">The party on which the delegation would be on behalf of</param>
        /// <param name="resource">The id of the resource to be checked for delegation</param>
        Task<List<DelegationCheckedRight>> GetDelegationCheck(Guid party, string resource);

        /// <summary>
        ///    Delegates the specified rights on a specified resource to someone on behalf of a specified party
        /// </summary>
        /// <param name="from">The party on which the delegation would be on behalf of</param>
        /// <param name="to">The one that will receive access to the resource</param>
        /// <param name="resource">The id of the resource to be delegated</param>
        /// <param name="rights">List of keys for the specific rights that are to be delegated on the resource</param>
        /// <returns> List of rightkeys, representing failed delegations </returns>
        Task<DelegationOutput> DelegateResource(Guid from, Guid to, string resource, List<string> rights);

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
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeResourceDelegation(Guid from, Guid to, string resourceId);

        /// <summary>
        /// Revokes a single right on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <param name="rightKey">The identifier of the right that is to be revoked</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeRightDelegation(Guid from, Guid to, string resourceId, string rightKey);

        /// <summary>
        /// Revokes a single right on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <param name="rightKeys">List of identifiers for the rights to be delegated</param>
        /// <returns></returns>
        Task<HttpResponseMessage> DelegateResourceRights(string from, string to, string resourceId, List<string> rightKeys);

        //// Access packages

        /// <summary>
        ///     Gets all access package delegations from someone to someone (or multiple someones)
        /// </summary>
        /// <param name="to">the one(s) who has received the delegated access. Can be either a guid or one of the following strings: "all", "me"</param>
        /// <param name="from">The the one(s) whose rights have been delegated to the one(s) specified in to. Can be either a guid or one of the following strings: "all", "me"</param>
        /// <param name="languageCode">The code of the language on which texts are to be returned</param>
        /// <returns>A list of all access package delegations</returns>
        Task<List<AccessPackageAccess>> GetAccessPackageAccesses(string to, string from, string languageCode);

        /// <summary>
        ///     Revokes access to a given package for a right holder (to) on behalf of a party (from)
        /// </summary>
        /// <param name="from">The party which has granted access to the package to the right holder</param>
        /// <param name="to">The right holder which currently has access to the access package</param>
        /// <param name="packageId">The access package which the right holder is to lose access to on behalf of the given party (from)</param>
        /// <returns>A HttpResponseMessage denoting whether or not the action was successful.</returns>
        Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, string packageId);

        /// <summary>
        ///    Creates a new delegation of an access package
        /// </summary>
        /// <param name="party">The party that is delegating the access</param>
        /// <param name="to">The id of the right holder that will receive the delegation</param>
        /// <param name="packageId">The id of the package to be delegated</param>
        /// <param name="languageCode">The code of the language on which texts are to be returned</param>
        Task<HttpResponseMessage> CreateAccessPackageDelegation(string party, Guid to, string packageId, string languageCode);
    }
}

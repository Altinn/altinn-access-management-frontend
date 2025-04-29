using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
        /// <summary>
        /// Servoice for access package logic
        /// </summary>
        public interface IAccessPackageService
        {
                /// <summary>
                ///     Performs a search for access packages based on the provided parameters and sorts them into a list of areas for frontend to display
                /// </summary>
                /// <param name="languageCode">languageCode.</param>
                /// <param name="searchString">searchString.</param>
                /// <returns>the resources that match the filters and search string corresponding to the provided page.</returns>
                Task<List<AccessAreaFE>> GetSearch(string languageCode, string searchString);

                /// <summary>
                ///     Gets all access package delegations a specified right holder has on behalf of a specified party
                /// </summary>
                /// <param name="rightHolderUuid">the uuid of one who has received the delegated access</param>
                /// <param name="rightOwnerUuid">The uuid of the party whose rights have been delegated to the right holder</param>
                /// <param name="languageCode">The code of the language on which texts are to be returned</param>
                /// <returns>A dictionary of lists (sorted by access area) containing all access package delegations that the right holder has on behalf of the specified right owner</returns>
                Task<Dictionary<string, List<AccessPackageDelegation>>> GetDelegationsToRightHolder(Guid rightHolderUuid, Guid rightOwnerUuid, string languageCode);

                /// <summary>
                ///     Revokes access to a given package for a right holder (to) on behalf of a party (from)
                /// </summary>
                /// <param name="from">The party which has granted access to the package to the right holder</param>
                /// <param name="to">The right holder which currently has access to the access package</param>
                /// <param name="packageId">The access package which the right holder is to lose access to on behalf of the given party (from)</param>
                /// <returns>A HttpResponseMessage denoting whether or not the action was successfull.</returns>
                Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, string packageId);

                /// <summary>
                ///    Creates a new delegation of an access package
                /// </summary>
                /// <param name="party">The party that is performing the access delegation</param>
                /// <param name="to">The id of the right holder that will receive the access</param>
                /// <param name="from">The id of the party that the rightholder will be granted access on behalf of</param>
                /// <param name="packageId">The id of the package to be delegated</param>
                /// <param name="languageCode">The code of the language on which texts are to be returned</param>
                /// <returns></returns> 
                Task<HttpResponseMessage> CreateDelegation(Guid party, Guid to, Guid from, string packageId, string languageCode);

                /// <summary>
                ///    Checks if the user can delegate access packages on behalf of the specified reportee
                /// </summary>
                /// <param name="delegationCheckRequest">The request containing the packages to check and the reportee to check on behalf of</param>
                /// <returns>The response containing whether or not the user can delegate the packages</returns>
                Task<ActionResult<List<AccessPackageDelegationCheckResponse>>> DelegationCheck(DelegationCheckRequest delegationCheckRequest);
    }
}

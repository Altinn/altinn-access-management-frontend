using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;

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
        ///    Creates a new delegation of an access package
        /// </summary>
        /// <param name="party">The party that is delegating the access</param>
        /// <param name="delegation">The package to be delegated</param>
        /// <returns></returns> 
        Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation);
    }
}

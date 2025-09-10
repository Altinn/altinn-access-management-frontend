using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for access package logic
    /// </summary>
    public interface IAccessPackageService
    {
        /// <summary>
        /// Fetch a single access package by id
        /// </summary>
        /// <param name="languageCode">language code</param>
        /// <param name="packageId">package id</param>
        /// <returns>The access package</returns>
        Task<AccessPackage> GetAccessPackageById(string languageCode, Guid packageId);
        
        /// <summary>
        ///     Performs a search for access packages based on the provided parameters and sorts them into a list of areas for frontend to display
        /// </summary>
        /// <param name="languageCode">languageCode.</param>
        /// <param name="searchString">searchString.</param>
        /// <returns>the resources that match the filters and search string corresponding to the provided page.</returns>
        Task<List<AccessAreaFE>> GetSearch(string languageCode, string searchString);

        /// <summary>
        ///     Gets all access package delegations one specified right holder (or all right holders) has on behalf of one specified party (or all reportee parties)
        /// </summary>
        /// <param name="party">The uuid of the party who is asking for the delegations</param>
        /// <param name="to">The uuid of the party who has received the delegated access packages (or empty, if delegations to all parties are to be returned)</param>
        /// <param name="from">The uuid of the party whose accesses have been delegated (or empty, if delegations from all parties are to be returned)</param>
        /// <param name="languageCode">The code of the language on which texts are to be returned</param>
        /// <returns>A dictionary of lists (sorted by access area) containing all access package delegations that have been granted from one (or more) party to another (or several others)</returns>
        Task<Dictionary<Guid, List<PackagePermission>>> GetDelegations(Guid party, Guid? to, Guid? from, string languageCode);

        /// <summary>
        ///     Gets a single access package and its permissions (not grouped by area)
        /// </summary>
        /// <param name="party">The uuid of the party who is asking for the package</param>
        /// <param name="to">The uuid of the party who has received the delegated access package</param>
        /// <param name="from">The uuid of the party whose accesses have been delegated</param>
        /// <param name="packageId">The uuid of the access package to filter by</param>
        /// <param name="languageCode">The code of the language on which texts are to be returned</param>
        /// <returns>The package and its permissions, or null if not found</returns>
        Task<AccessPackageFE> GetSinglePackagePermission(Guid party, Guid? to, Guid? from, Guid packageId, string languageCode);

        /// <summary>
        ///     Revokes access to a given package for a right holder (to) on behalf of a party (from)
        /// </summary>
        /// <param name="from">The party which has granted access to the package to the right holder</param>
        /// <param name="to">The right holder which currently has access to the access package</param>
        /// <param name="party">The party that is performing the action</param>
        /// <param name="packageId">The access package which the right holder is to lose access to on behalf of the given party (from)</param>
        /// <returns>A HttpResponseMessage denoting whether or not the action was successful.</returns>
        Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, Guid party, string packageId);

        /// <summary>
        ///    Creates a new delegation of an access package
        /// </summary>
        /// <param name="party">The party that is performing the access delegation</param>
        /// <param name="to">The id of the right holder that will receive the access</param>
        /// <param name="from">The id of the party that the rightholder will be granted access on behalf of</param>
        /// <param name="packageId">The id of the package to be delegated</param>
        /// <returns></returns> 
        Task<HttpResponseMessage> CreateDelegation(Guid party, Guid to, Guid from, string packageId);

        /// <summary>
        ///    Retrieves delegation capability (can delegate or not) for all access packages on behalf of the specified party
        /// </summary>
        /// <param name="party">The party to check delegation for (reportee)</param>
        /// <returns>List with delegation check results for all packages</returns>
        Task<List<DelegationCheck>> DelegationCheck(Guid party);
    }
}

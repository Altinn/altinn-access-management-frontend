﻿using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with access package metadata
    /// </summary>
    public interface IAccessPackageClient
    {
        /// <summary>
        /// Retrieve result of a search in all access packages. If no parameters are given, all access packages are returned
        /// </summary>
        /// <param name="languageCode">the language to use in texts returned and searched in</param>
        /// <param name="searchString">the text to be searched for</param>
        /// <returns>List of access packages matching the search parameters</returns>
        Task<IEnumerable<SearchObject<AccessPackage>>> GetAccessPackageSearchMatches(string languageCode, string searchString);

        /// <summary>
        ///    Creates a new delegation of an access package
        /// </summary>
        /// <param name="party">The party that is performing the access delegation</param>
        /// <param name="to">The id of the right holder that will receive the access</param>
        /// <param name="from">The id of the party that the rightholder will be granted access on behalf of</param>
        /// <param name="packageId">The id of the package to be delegated</param>
        Task<HttpResponseMessage> CreateAccessPackageDelegation(Guid party, Guid to, Guid from, string packageId);

        /// <summary>
        ///     Revokes access to a given package for a right holder (to) on behalf of a party (from)
        /// </summary>
        /// <param name="from">The party which has granted access to the package to the right holder</param>
        /// <param name="to">The right holder which currently has access to the access package</param>
        /// <param name="party">The party that is performing the action</param>
        /// <param name="packageId">The access package which the right holder is to lose access to on behalf of the given party (from)</param>
        /// <returns>A HttpResponseMessage denoting whether or not the action was successful.</returns>
        Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, Guid party, string packageId);
    }
}

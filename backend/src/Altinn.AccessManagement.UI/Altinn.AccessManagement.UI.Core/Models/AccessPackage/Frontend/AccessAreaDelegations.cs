using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// A grouping of access package delegations that belong to the same area
    /// </summary>
    internal class AccessAreaDelegations
    {
        /// <summary>
        /// Identifier of the AccessArea
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// An url that provides the Icon associated with this area and it's access packages
        /// </summary>
        public string IconUrl { get; set; }

        /// <summary>
        /// The package delegations that are in this area group
        /// </summary>
        public List<AccessPackageDelegation> AccessPackageDelegations { get; set; }

        /// <summary>
        /// Constructor for enritching an area with access package delegations to make it into an AccessAreaFE
        /// </summary>
        public AccessAreaDelegations(AccessArea area, List<AccessPackageDelegation> accessPackageDelegations)
        {
            Id = area.Id;
            Name = area.Name;
            Description = area.Description;
            IconUrl = area.IconUrl;
            AccessPackageDelegations = accessPackageDelegations;
        }
    }
}

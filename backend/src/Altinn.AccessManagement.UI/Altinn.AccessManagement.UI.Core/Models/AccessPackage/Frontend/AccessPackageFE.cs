using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// Access packages frontend model
    /// </summary>
    public class AccessPackageFE
    {
        /// <summary>
        /// Identifier for the access package
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Urn for the access package
        /// </summary>
        public string Urn { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Indicates if the package can be used for delegation
        /// </summary>
        public bool IsAssignable { get; set; }

        /// <summary>
        /// Indicates if the package can be used for delegation
        /// </summary>
        public bool IsDelegable { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The area the package belongs to
        /// </summary>
        public AccessArea Area { get; set; }

        /// <summary>
        /// The type of the package
        /// </summary>
        public TypeDto Type { get; set; }

        /// <summary>
        /// Resources, enriched from the resource registry
        /// </summary>
        public List<ServiceResourceFE> Resources { get; set; }

        /// <summary>
        /// Permissions
        /// </summary>
        public List<PermissionFE> Permissions { get; set; }

        /// <summary>
        /// Maps an access package to the frontend model, replacing its resources with their enriched counterparts
        /// </summary>
        /// <param name="accessPackage">The access package</param>
        /// <param name="resourcesByRefId">Enriched resources keyed by the Access Management resource RefId</param>
        /// <returns>The mapped access package</returns>
        public static AccessPackageFE FromAccessPackage(AccessPackage accessPackage, IReadOnlyDictionary<string, ServiceResourceFE> resourcesByRefId)
        {
            return new AccessPackageFE
            {
                Id = accessPackage.Id.ToString(),
                Urn = accessPackage.Urn,
                Name = accessPackage.Name,
                Description = accessPackage.Description,
                IsAssignable = accessPackage.IsAssignable,
                IsDelegable = accessPackage.IsDelegable,
                Area = accessPackage.Area,
                Type = accessPackage.Type,
                Resources = (accessPackage.Resources ?? [])
                    .Where(resource => resource?.RefId != null && resourcesByRefId.ContainsKey(resource.RefId))
                    .Select(resource => resourcesByRefId[resource.RefId])
                    .ToList(),
            };
        }
    }
}
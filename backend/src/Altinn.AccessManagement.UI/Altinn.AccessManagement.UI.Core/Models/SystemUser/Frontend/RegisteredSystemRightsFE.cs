using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend
{
    /// <summary>
    /// Model for resources and access packages used as system rights
    /// </summary>
    public class RegisteredSystemRightsFE
    {
        /// <summary>
        /// List of resources information
        /// </summary>
        [JsonPropertyName("resources")]
        public List<ServiceResourceFE> Resources { get; set; } = new List<ServiceResourceFE>();

        /// <summary>
        /// List of access package information
        /// </summary>
        [JsonPropertyName("accessPackages")]
        public List<AccessPackageFE> AccessPackages { get; set; } = new List<AccessPackageFE>();
    }
}
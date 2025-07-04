using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Enums;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// Model describing a resource in an access package
    /// </summary>
    public class AccessPackageResourceFE
    {
        /// <summary>
        /// The identifier of the resource
        /// </summary>
        public string Identifier { get; set; } // refId

        /// <summary>
        /// The title of service
        /// </summary>
        public string Title { get; set; } // name

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; } // description

        /// <summary>
        /// Name of resource owner
        /// </summary>
        public string ResourceOwnerName { get; set; } // provider.name

        /// <summary>
        /// URL of the resource owner's logo
        /// </summary>
        public string ResourceOwnerLogoUrl { get; set; } // provider.logoUrl

        /// <summary>
        /// Orgcode of the resource owner
        /// </summary>
        public string ResourceOwnerOrgcode { get; set; } // provider.code

        /// <summary>
        /// ResourceType
        /// </summary>
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResourceType ResourceType { get; set; } // type.name
    }
}

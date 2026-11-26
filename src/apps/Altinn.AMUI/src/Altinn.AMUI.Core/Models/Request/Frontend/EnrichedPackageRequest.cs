using Altinn.AMUI.Core.Models.AccessPackage.Frontend;

namespace Altinn.AMUI.Core.Models.Request.Frontend
{
    /// <summary>
    /// Used to show enriched access package requests
    /// </summary>
    public class EnrichedPackageRequest : RequestFE
    {
        /// <summary>
        /// The full access package object
        /// </summary>
        public AccessPackageFE Package { get; set; }
    }
}

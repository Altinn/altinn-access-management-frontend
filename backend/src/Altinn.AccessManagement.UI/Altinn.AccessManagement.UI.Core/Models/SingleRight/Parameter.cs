using Newtonsoft.Json;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight
{
    /// <summary>
    ///     Represents a reason for why something failed.
    /// </summary>
    public class Parameter
    {
        /// <summary>
        ///     explicit information about the which roles that has access to delegate the right
        /// </summary>
        [JsonProperty("roleRequirementsMatcher")]
        public List<IdValuePair> RoleRequirementsMatcher { get; }
    }
}

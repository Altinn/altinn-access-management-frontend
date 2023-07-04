using Newtonsoft.Json;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    ///     The Resource object for the delegation
    /// </summary>
    /// <param name="Id">
    ///     The altinn ID of what field etc. That is used to be delegated to.
    /// </param>
    /// <param name="Value">
    ///     The ID value of the field that is used to be delegated to.
    /// </param>
    /// <summary>
    ///     Represents a resource.
    /// </summary>
    public class Resource
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="Resource" /> class.
        /// </summary>
        /// <param name="id">The altinn ID of what field etc. That is used to be delegated to.</param>
        /// <param name="value">The ID value of the field that is used to be delegated to.</param>
        public Resource(string id, string value)
        {
            Id = id;
            Value = value;
        }

        /// <summary>
        ///     The altinn ID of what field etc. That is used to be delegated to.
        /// </summary>
        [JsonProperty("id")]
        public string Id { get; }

        /// <summary>
        ///     The ID value of the field that is used to be delegated to.
        /// </summary>
        [JsonProperty("value")]
        public string Value { get; }
    }
}

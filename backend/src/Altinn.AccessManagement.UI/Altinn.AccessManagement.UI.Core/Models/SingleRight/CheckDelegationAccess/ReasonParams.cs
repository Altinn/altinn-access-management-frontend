using Newtonsoft.Json;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    ///     Represents a reason for why something failed.
    /// </summary>
    public class ReasonParams
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="ReasonParams" /> class.
        /// </summary>
        /// <param name="name">The name of the parameter.</param>
        /// <param name="value">The value of the parameter.</param>
        public ReasonParams(string name, string value)
        {
            Name = name;
            Value = value;
        }

        /// <summary>
        ///     Name of the reasons why something failed.
        /// </summary>
        [JsonProperty("name")]
        public string Name { get; }

        /// <summary>
        ///     Values of the reasons why something failed.
        /// </summary>
        [JsonProperty("value")]
        public string Value { get; }
    }
}

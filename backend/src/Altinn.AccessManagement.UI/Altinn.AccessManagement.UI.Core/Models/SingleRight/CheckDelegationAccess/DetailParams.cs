using Newtonsoft.Json;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    ///     Represents a reason for why something failed.
    /// </summary>
    public class DetailParams
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="DetailParams" /> class.
        /// </summary>
        /// <param name="name">The name of the parameter.</param>
        /// <param name="value">The value of the parameter.</param>
        public DetailParams(string name, string value)
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
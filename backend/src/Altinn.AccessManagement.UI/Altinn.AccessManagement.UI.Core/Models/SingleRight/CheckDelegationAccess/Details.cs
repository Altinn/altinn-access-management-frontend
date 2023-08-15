using Newtonsoft.Json;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    ///     Represents details about why something failed.
    /// </summary>
    public class Details
    {
        /// <summary>
        ///     The detail code of the response.
        /// </summary>
        [JsonProperty("detailCode")]
        public string? Code { get; set; }

        /// <summary>
        ///     Info about details for the response.
        /// </summary>
        [JsonProperty("description")]
        public string? Description { get; set; }

        /// <summary>
        ///     Further details about the reason for the response.
        /// </summary>
        [JsonProperty("detailParams")]
        public List<DetailParams>? DetailParams { get; set; }
    }
}

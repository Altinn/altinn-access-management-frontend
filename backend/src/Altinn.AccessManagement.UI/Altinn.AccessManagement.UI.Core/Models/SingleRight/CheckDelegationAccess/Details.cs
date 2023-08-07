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
        public string DetailCode { get; set; }
        
        /// <summary>
        ///     Info about details for the response.
        /// </summary>
        public string Info { get; set; }
        
        /// <summary>
        ///     Further details about the reason for the response.
        /// </summary>
        [JsonProperty("DetailParams")]
        public List<DetailParams> DetailParams { get; set; }
    }
}

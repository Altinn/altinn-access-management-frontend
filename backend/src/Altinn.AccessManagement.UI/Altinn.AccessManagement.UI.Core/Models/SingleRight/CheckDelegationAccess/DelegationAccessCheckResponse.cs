using Newtonsoft.Json;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    ///     Represents the response of the backend for Delegation access check response.
    /// </summary>
    public class DelegationAccessCheckResponse
    {
        /// <summary>
        ///     Represents the response of the backend for Delegation access check response.
        /// </summary>
        /// <param name="rightKey">The key for the right.</param>
        /// <param name="resources">The list of resources.</param>
        /// <param name="action">The action performed.</param>
        /// <param name="status">The status of the response.</param>
        /// <param name="details">The reason for the response.</param>
        public DelegationAccessCheckResponse(
            string rightKey,
            List<IdValuePair> resources,
            string action,
            string status,
            Details details)
        {
            RightKey = rightKey;
            Resources = resources;
            Action = action;
            Status = status;
            Details = details;
        }

        /// <summary>
        ///     The key for the right.
        /// </summary>
        [JsonProperty("rightKey")]
        public string RightKey { get; set; }

        /// <summary>
        ///     The list of resources.
        /// </summary>
        [JsonProperty("resource")]
        public List<IdValuePair> Resources { get; set; }

        /// <summary>
        ///     The action performed.
        /// </summary>
        [JsonProperty("action")]
        public string Action { get; set; }

        /// <summary>
        ///     The status of the response.
        /// </summary>
        [JsonProperty("status")]
        public string Status { get; set; }

        /// <summary>
        ///     The reason for the response.
        /// </summary>
        [JsonProperty("details")]
        public Details Details { get; set; }
    }
}

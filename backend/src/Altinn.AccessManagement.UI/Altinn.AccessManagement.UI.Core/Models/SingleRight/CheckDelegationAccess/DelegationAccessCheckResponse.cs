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
        /// <param name="resource">The list of resources.</param>
        /// <param name="action">The action performed.</param>
        /// <param name="status">The status of the response.</param>
        /// <param name="faultCode">The fault code, if applicable.</param>
        /// <param name="reason">The reason for the response.</param>
        /// <param name="reasonParams">The list of parameters.</param>
        /// <param name="httpErrorResponse">The optional HTTP error response.</param>
        public DelegationAccessCheckResponse(
            string rightKey,
            List<AttributeMatch> resource,
            string action,
            string status,
            string faultCode,
            string reason,
            List<ReasonParams> reasonParams,
            HttpErrorResponse? httpErrorResponse = null)
        {
            RightKey = rightKey;
            Resource = resource;
            Action = action;
            Status = status;
            FaultCode = faultCode;
            Reason = reason;
            ReasonParams = reasonParams;
            HttpErrorResponse = httpErrorResponse;
        }

        /// <summary>
        ///     The key for the right.
        /// </summary>
        [JsonProperty("rightKey")]
        public string RightKey { get; init; }

        /// <summary>
        ///     The list of resources.
        /// </summary>
        [JsonProperty("resource")]
        public List<AttributeMatch> Resource { get; init; }

        /// <summary>
        ///     The action performed.
        /// </summary>
        [JsonProperty("action")]
        public string Action { get; init; }

        /// <summary>
        ///     The status of the response.
        /// </summary>
        [JsonProperty("status")]
        public string Status { get; init; }

        /// <summary>
        ///     The fault code, if applicable.
        /// </summary>
        [JsonProperty("faultCode")]
        public string FaultCode { get; init; }

        /// <summary>
        ///     The reason for the response.
        /// </summary>
        [JsonProperty("reason")]
        public string Reason { get; init; }

        /// <summary>
        ///     The list of parameters.
        /// </summary>
        [JsonProperty("reasonParams")]
        public List<ReasonParams> ReasonParams { get; init; }

        /// <summary>
        ///     The optional HTTP error response.
        /// </summary>
        [JsonProperty("httpErrorResponse")]
        public HttpErrorResponse? HttpErrorResponse { get; init; }
    }
}

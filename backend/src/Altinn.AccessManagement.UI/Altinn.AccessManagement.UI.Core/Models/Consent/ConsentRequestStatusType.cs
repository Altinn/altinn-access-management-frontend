using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.Consent
{
    /// <summary>
    /// Status type for consent requests
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ConsentRequestStatusType
    {
        /// <summary>
        /// Consent request has been created and is awaiting response
        /// </summary>
        Created,

        /// <summary>
        /// Consent request has been accepted
        /// </summary>
        Accepted,

        /// <summary>
        /// Consent request has been rejected
        /// </summary>
        Rejected,

        /// <summary>
        /// Consent has been revoked
        /// </summary>
        Revoked,

        /// <summary>
        /// Consent request has been deleted
        /// </summary>
        Deleted,

        /// <summary>
        /// Consent request has expired
        /// </summary>
        Expired,
    }
}

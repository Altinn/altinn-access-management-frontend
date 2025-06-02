using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.Consent
{
    /// <summary>
    /// Enum for the status of a consent request
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ConsentRequestStatusType
    {
        /// <summary>
        /// Consent request created
        /// </summary>
        [EnumMember(Value = "created")]
        Created = 0,

        /// <summary>
        /// Consent request rejected
        /// </summary>
        [EnumMember(Value = "rejected")]
        Rejected = 1,

        /// <summary>
        /// Consent request approved
        /// </summary>
        [EnumMember(Value = "accepted")]
        Accepted = 2,

        /// <summary>
        /// Consent request revoked
        /// </summary>
        [EnumMember(Value = "revoked")]
        Revoked = 3,

        /// <summary>
        /// Consent request deleted
        /// </summary>
        [EnumMember(Value = "deleted")]
        Deleted = 4
    }
}
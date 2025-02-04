using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Fixed values for DetailCodes
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    [DataContract]
    public enum DetailCode
    {
        /// <summary>
        /// Unknown reason
        /// </summary>
        [EnumMember(Value = "Unknown")]
        Unknown,

        /// <summary>
        /// Has access by a delegated role in ER or Altinn 
        /// </summary>
        [EnumMember(Value = "RoleAccess")]
        RoleAccess,

        /// <summary>
        /// Has access by direct delegation
        /// </summary>
        [EnumMember(Value = "DelegationAccess")]
        DelegationAccess,

        /// <summary>
        /// The service requires explicit access in SRR and the reportee has this
        /// </summary>
        [EnumMember(Value = "SrrRightAccess")]
        SrrRightAccess,

        /// <summary>
        /// Has not access by a delegation of role in ER or Altinn
        /// </summary>
        [EnumMember(Value = "MissingRoleAccess")]
        MissingRoleAccess,

        /// <summary>
        /// Has not access by direct delegation
        /// </summary>
        [EnumMember(Value = "MissingDelegationAccess")]
        MissingDelegationAccess,

        /// <summary>
        /// The service requires explicit access in SRR and the reportee is missing this
        /// </summary>
        [EnumMember(Value = "MissingSrrRightAccess")]
        MissingSrrRightAccess,

        /// <summary>
        /// The service requires explicit authentication level and the reportee is missing this
        /// </summary>
        [EnumMember(Value = "InsufficientAuthenticationLevel")]
        InsufficientAuthenticationLevel,

        /// <summary>
        /// The receiver already has the right
        /// </summary>
        [EnumMember(Value = "AlreadyDelegated")]
        AlreadyDelegated,

        /// <summary>
        /// The receiver has the right based on Access List delegation
        /// </summary>
        [EnumMember(Value = "AccessListValidationPass")]
        AccessListValidationPass,

        /// <summary>
        /// The receiver does not have the right based on Access List delegation
        /// </summary>
        [EnumMember(Value = "AccessListValidationFail")]
        AccessListValidationFail
    }
}
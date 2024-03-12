/*
 * Altinn Profile
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * Generated by: https://github.com/openapitools/openapi-generator.git
 */


using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.IO;
using System.Runtime.Serialization;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Integrations.Profile.Models
{
    /// <summary>
    /// ProfileUserProfileModel
    /// </summary>
    [DataContract(Name = "UserProfile")]
    public partial class ProfileUserProfileModel : IValidatableObject
    {

        /// <summary>
        /// Gets or Sets UserType
        /// </summary>
        [DataMember(Name = "userType", EmitDefaultValue = false)]
        public ProfileUserTypeModel? UserType { get; set; }
        /// <summary>
        /// Initializes a new instance of the <see cref="ProfileUserProfileModel" /> class.
        /// </summary>
        /// <param name="userId">userId.</param>
        /// <param name="userUuid">userUuid.</param>
        /// <param name="userName">userName.</param>
        /// <param name="externalIdentity">externalIdentity.</param>
        /// <param name="isReserved">isReserved.</param>
        /// <param name="phoneNumber">phoneNumber.</param>
        /// <param name="email">email.</param>
        /// <param name="partyId">partyId.</param>
        /// <param name="party">party.</param>
        /// <param name="userType">userType.</param>
        /// <param name="profileSettingPreference">profileSettingPreference.</param>
        public ProfileUserProfileModel(int userId = default(int), Guid? userUuid = default(Guid?), string userName = default(string), string externalIdentity = default(string), bool isReserved = default(bool), string phoneNumber = default(string), string email = default(string), int partyId = default(int), ProfilePartyModel party = default(ProfilePartyModel), ProfileUserTypeModel? userType = default(ProfileUserTypeModel?), ProfileProfileSettingPreferenceModel profileSettingPreference = default(ProfileProfileSettingPreferenceModel))
        {
            this.UserId = userId;
            this.UserUuid = userUuid;
            this.UserName = userName;
            this.ExternalIdentity = externalIdentity;
            this.IsReserved = isReserved;
            this.PhoneNumber = phoneNumber;
            this.Email = email;
            this.PartyId = partyId;
            this.Party = party;
            this.UserType = userType;
            this.ProfileSettingPreference = profileSettingPreference;
        }

        /// <summary>
        /// Gets or Sets UserId
        /// </summary>
        [DataMember(Name = "userId", EmitDefaultValue = false)]
        public int UserId { get; set; }

        /// <summary>
        /// Gets or Sets UserUuid
        /// </summary>
        [DataMember(Name = "userUuid", EmitDefaultValue = true)]
        public Guid? UserUuid { get; set; }

        /// <summary>
        /// Gets or Sets UserName
        /// </summary>
        [DataMember(Name = "userName", EmitDefaultValue = true)]
        public string UserName { get; set; }

        /// <summary>
        /// Gets or Sets ExternalIdentity
        /// </summary>
        [DataMember(Name = "externalIdentity", EmitDefaultValue = true)]
        public string ExternalIdentity { get; set; }

        /// <summary>
        /// Gets or Sets IsReserved
        /// </summary>
        [DataMember(Name = "isReserved", EmitDefaultValue = true)]
        public bool IsReserved { get; set; }

        /// <summary>
        /// Gets or Sets PhoneNumber
        /// </summary>
        [DataMember(Name = "phoneNumber", EmitDefaultValue = true)]
        public string PhoneNumber { get; set; }

        /// <summary>
        /// Gets or Sets Email
        /// </summary>
        [DataMember(Name = "email", EmitDefaultValue = true)]
        public string Email { get; set; }

        /// <summary>
        /// Gets or Sets PartyId
        /// </summary>
        [DataMember(Name = "partyId", EmitDefaultValue = false)]
        public int PartyId { get; set; }

        /// <summary>
        /// Gets or Sets Party
        /// </summary>
        [DataMember(Name = "party", EmitDefaultValue = false)]
        public ProfilePartyModel Party { get; set; }

        /// <summary>
        /// Gets or Sets ProfileSettingPreference
        /// </summary>
        [DataMember(Name = "profileSettingPreference", EmitDefaultValue = false)]
        public ProfileProfileSettingPreferenceModel ProfileSettingPreference { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class ProfileUserProfileModel {\n");
            sb.Append("  UserId: ").Append(UserId).Append("\n");
            sb.Append("  UserUuid: ").Append(UserUuid).Append("\n");
            sb.Append("  UserName: ").Append(UserName).Append("\n");
            sb.Append("  ExternalIdentity: ").Append(ExternalIdentity).Append("\n");
            sb.Append("  IsReserved: ").Append(IsReserved).Append("\n");
            sb.Append("  PhoneNumber: ").Append(PhoneNumber).Append("\n");
            sb.Append("  Email: ").Append(Email).Append("\n");
            sb.Append("  PartyId: ").Append(PartyId).Append("\n");
            sb.Append("  Party: ").Append(Party).Append("\n");
            sb.Append("  UserType: ").Append(UserType).Append("\n");
            sb.Append("  ProfileSettingPreference: ").Append(ProfileSettingPreference).Append("\n");
            sb.Append("}\n");
            return sb.ToString();
        }

        /// <summary>
        /// Returns the JSON string presentation of the object
        /// </summary>
        /// <returns>JSON string presentation of the object</returns>
        public virtual string ToJson()
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(this, Newtonsoft.Json.Formatting.Indented);
        }

        /// <summary>
        /// To validate all properties of the instance
        /// </summary>
        /// <param name="validationContext">Validation context</param>
        /// <returns>Validation Result</returns>
        IEnumerable<System.ComponentModel.DataAnnotations.ValidationResult> IValidatableObject.Validate(ValidationContext validationContext)
        {
            yield break;
        }
    }

}

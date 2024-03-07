/*
 * altinn-platform-profile
 *
 * Altinn Platform Profile
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
    /// ProfileProfileSettingPreferenceModel
    /// </summary>
    [DataContract(Name = "ProfileSettingPreference")]
    public partial class ProfileProfileSettingPreferenceModel : IValidatableObject
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ProfileProfileSettingPreferenceModel" /> class.
        /// </summary>
        /// <param name="language">language.</param>
        /// <param name="preSelectedPartyId">preSelectedPartyId.</param>
        /// <param name="doNotPromptForParty">doNotPromptForParty.</param>
        public ProfileProfileSettingPreferenceModel(string language = default(string), int preSelectedPartyId = default(int), bool doNotPromptForParty = default(bool))
        {
            this.Language = language;
            this.PreSelectedPartyId = preSelectedPartyId;
            this.DoNotPromptForParty = doNotPromptForParty;
        }

        /// <summary>
        /// Gets or Sets Language
        /// </summary>
        [DataMember(Name = "Language", EmitDefaultValue = false)]
        public string Language { get; set; }

        /// <summary>
        /// Gets or Sets PreSelectedPartyId
        /// </summary>
        [DataMember(Name = "PreSelectedPartyId", EmitDefaultValue = false)]
        public int PreSelectedPartyId { get; set; }

        /// <summary>
        /// Gets or Sets DoNotPromptForParty
        /// </summary>
        [DataMember(Name = "DoNotPromptForParty", EmitDefaultValue = true)]
        public bool DoNotPromptForParty { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class ProfileProfileSettingPreferenceModel {\n");
            sb.Append("  Language: ").Append(Language).Append("\n");
            sb.Append("  PreSelectedPartyId: ").Append(PreSelectedPartyId).Append("\n");
            sb.Append("  DoNotPromptForParty: ").Append(DoNotPromptForParty).Append("\n");
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

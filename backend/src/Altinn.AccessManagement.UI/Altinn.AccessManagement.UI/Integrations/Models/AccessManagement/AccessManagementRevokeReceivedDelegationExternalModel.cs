/*
 * Altinn.AccessManagement
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
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

namespace Altinn.AccessManagement.UI.Integrations.AccessManagement.Models
{
    /// <summary>
    /// AccessManagementRevokeReceivedDelegationExternalModel
    /// </summary>
    [DataContract(Name = "RevokeReceivedDelegationExternal")]
    public partial class AccessManagementRevokeReceivedDelegationExternalModel : IValidatableObject
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementRevokeReceivedDelegationExternalModel" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected AccessManagementRevokeReceivedDelegationExternalModel() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementRevokeReceivedDelegationExternalModel" /> class.
        /// </summary>
        /// <param name="from">from (required).</param>
        /// <param name="rights">rights (required).</param>
        public AccessManagementRevokeReceivedDelegationExternalModel(List<AccessManagementAttributeMatchExternalModel> from = default(List<AccessManagementAttributeMatchExternalModel>), List<AccessManagementBaseRightExternalModel> rights = default(List<AccessManagementBaseRightExternalModel>))
        {
            // to ensure "from" is required (not null)
            if (from == null)
            {
                throw new ArgumentNullException("from is a required property for AccessManagementRevokeReceivedDelegationExternalModel and cannot be null");
            }
            this.From = from;
            // to ensure "rights" is required (not null)
            if (rights == null)
            {
                throw new ArgumentNullException("rights is a required property for AccessManagementRevokeReceivedDelegationExternalModel and cannot be null");
            }
            this.Rights = rights;
        }

        /// <summary>
        /// Gets or Sets From
        /// </summary>
        [DataMember(Name = "from", IsRequired = true, EmitDefaultValue = true)]
        public List<AccessManagementAttributeMatchExternalModel> From { get; set; }

        /// <summary>
        /// Gets or Sets Rights
        /// </summary>
        [DataMember(Name = "rights", IsRequired = true, EmitDefaultValue = true)]
        public List<AccessManagementBaseRightExternalModel> Rights { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class AccessManagementRevokeReceivedDelegationExternalModel {\n");
            sb.Append("  From: ").Append(From).Append("\n");
            sb.Append("  Rights: ").Append(Rights).Append("\n");
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

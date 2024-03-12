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
    /// AccessManagementRightDelegationResultExternalModel
    /// </summary>
    [DataContract(Name = "RightDelegationResultExternal")]
    public partial class AccessManagementRightDelegationResultExternalModel : IValidatableObject
    {

        /// <summary>
        /// Gets or Sets Status
        /// </summary>
        [DataMember(Name = "status", IsRequired = true, EmitDefaultValue = true)]
        public AccessManagementDelegationStatusExternalModel Status { get; set; }
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementRightDelegationResultExternalModel" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected AccessManagementRightDelegationResultExternalModel() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementRightDelegationResultExternalModel" /> class.
        /// </summary>
        /// <param name="rightKey">rightKey (required).</param>
        /// <param name="resource">resource (required).</param>
        /// <param name="action">action (required).</param>
        /// <param name="status">status (required).</param>
        /// <param name="details">details.</param>
        public AccessManagementRightDelegationResultExternalModel(string rightKey = default(string), List<AccessManagementAttributeMatchExternalModel> resource = default(List<AccessManagementAttributeMatchExternalModel>), string action = default(string), AccessManagementDelegationStatusExternalModel status = default(AccessManagementDelegationStatusExternalModel), List<AccessManagementDetailExternalModel> details = default(List<AccessManagementDetailExternalModel>))
        {
            // to ensure "rightKey" is required (not null)
            if (rightKey == null)
            {
                throw new ArgumentNullException("rightKey is a required property for AccessManagementRightDelegationResultExternalModel and cannot be null");
            }
            this.RightKey = rightKey;
            // to ensure "resource" is required (not null)
            if (resource == null)
            {
                throw new ArgumentNullException("resource is a required property for AccessManagementRightDelegationResultExternalModel and cannot be null");
            }
            this.Resource = resource;
            // to ensure "action" is required (not null)
            if (action == null)
            {
                throw new ArgumentNullException("action is a required property for AccessManagementRightDelegationResultExternalModel and cannot be null");
            }
            this.Action = action;
            this.Status = status;
            this.Details = details;
        }

        /// <summary>
        /// Gets or Sets RightKey
        /// </summary>
        [DataMember(Name = "rightKey", IsRequired = true, EmitDefaultValue = true)]
        public string RightKey { get; set; }

        /// <summary>
        /// Gets or Sets Resource
        /// </summary>
        [DataMember(Name = "resource", IsRequired = true, EmitDefaultValue = true)]
        public List<AccessManagementAttributeMatchExternalModel> Resource { get; set; }

        /// <summary>
        /// Gets or Sets Action
        /// </summary>
        [DataMember(Name = "action", IsRequired = true, EmitDefaultValue = true)]
        public string Action { get; set; }

        /// <summary>
        /// Gets or Sets Details
        /// </summary>
        [DataMember(Name = "details", EmitDefaultValue = true)]
        public List<AccessManagementDetailExternalModel> Details { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class AccessManagementRightDelegationResultExternalModel {\n");
            sb.Append("  RightKey: ").Append(RightKey).Append("\n");
            sb.Append("  Resource: ").Append(Resource).Append("\n");
            sb.Append("  Action: ").Append(Action).Append("\n");
            sb.Append("  Status: ").Append(Status).Append("\n");
            sb.Append("  Details: ").Append(Details).Append("\n");
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
            // RightKey (string) minLength
            if (this.RightKey != null && this.RightKey.Length < 1)
            {
                yield return new System.ComponentModel.DataAnnotations.ValidationResult("Invalid value for RightKey, length must be greater than 1.", new [] { "RightKey" });
            }

            // Action (string) minLength
            if (this.Action != null && this.Action.Length < 1)
            {
                yield return new System.ComponentModel.DataAnnotations.ValidationResult("Invalid value for Action, length must be greater than 1.", new [] { "Action" });
            }

            yield break;
        }
    }

}

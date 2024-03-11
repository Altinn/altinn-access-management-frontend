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
    /// AccessManagementBaseRightExternalModel
    /// </summary>
    [DataContract(Name = "BaseRightExternal")]
    public partial class AccessManagementBaseRightExternalModel : IValidatableObject
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementBaseRightExternalModel" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected AccessManagementBaseRightExternalModel() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementBaseRightExternalModel" /> class.
        /// </summary>
        /// <param name="resource">resource (required).</param>
        /// <param name="action">action.</param>
        public AccessManagementBaseRightExternalModel(List<AccessManagementAttributeMatchExternalModel> resource = default(List<AccessManagementAttributeMatchExternalModel>), string action = default(string))
        {
            // to ensure "resource" is required (not null)
            if (resource == null)
            {
                throw new ArgumentNullException("resource is a required property for AccessManagementBaseRightExternalModel and cannot be null");
            }
            this.Resource = resource;
            this.Action = action;
        }

        /// <summary>
        /// Gets or Sets Resource
        /// </summary>
        [DataMember(Name = "resource", IsRequired = true, EmitDefaultValue = true)]
        public List<AccessManagementAttributeMatchExternalModel> Resource { get; set; }

        /// <summary>
        /// Gets or Sets Action
        /// </summary>
        [DataMember(Name = "action", EmitDefaultValue = true)]
        public string Action { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class AccessManagementBaseRightExternalModel {\n");
            sb.Append("  Resource: ").Append(Resource).Append("\n");
            sb.Append("  Action: ").Append(Action).Append("\n");
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

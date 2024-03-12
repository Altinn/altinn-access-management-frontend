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
    /// AccessManagementAttributeMatchModel
    /// </summary>
    [DataContract(Name = "AttributeMatch")]
    public partial class AccessManagementAttributeMatchModel : IValidatableObject
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementAttributeMatchModel" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected AccessManagementAttributeMatchModel() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementAttributeMatchModel" /> class.
        /// </summary>
        /// <param name="id">id (required).</param>
        /// <param name="value">value (required).</param>
        public AccessManagementAttributeMatchModel(string id = default(string), string value = default(string))
        {
            // to ensure "id" is required (not null)
            if (id == null)
            {
                throw new ArgumentNullException("id is a required property for AccessManagementAttributeMatchModel and cannot be null");
            }
            this.Id = id;
            // to ensure "value" is required (not null)
            if (value == null)
            {
                throw new ArgumentNullException("value is a required property for AccessManagementAttributeMatchModel and cannot be null");
            }
            this.Value = value;
        }

        /// <summary>
        /// Gets or Sets Id
        /// </summary>
        [DataMember(Name = "id", IsRequired = true, EmitDefaultValue = true)]
        public string Id { get; set; }

        /// <summary>
        /// Gets or Sets Value
        /// </summary>
        [DataMember(Name = "value", IsRequired = true, EmitDefaultValue = true)]
        public string Value { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class AccessManagementAttributeMatchModel {\n");
            sb.Append("  Id: ").Append(Id).Append("\n");
            sb.Append("  Value: ").Append(Value).Append("\n");
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
            // Id (string) minLength
            if (this.Id != null && this.Id.Length < 1)
            {
                yield return new System.ComponentModel.DataAnnotations.ValidationResult("Invalid value for Id, length must be greater than 1.", new [] { "Id" });
            }

            // Value (string) minLength
            if (this.Value != null && this.Value.Length < 1)
            {
                yield return new System.ComponentModel.DataAnnotations.ValidationResult("Invalid value for Value, length must be greater than 1.", new [] { "Value" });
            }

            yield break;
        }
    }

}
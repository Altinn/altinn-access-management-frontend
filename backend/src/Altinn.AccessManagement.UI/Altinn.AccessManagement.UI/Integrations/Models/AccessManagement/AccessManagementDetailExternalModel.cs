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
    /// AccessManagementDetailExternalModel
    /// </summary>
    [DataContract(Name = "DetailExternal")]
    public partial class AccessManagementDetailExternalModel : IValidatableObject
    {

        /// <summary>
        /// Gets or Sets Code
        /// </summary>
        [DataMember(Name = "code", EmitDefaultValue = false)]
        public AccessManagementDetailCodeExternalModel? Code { get; set; }
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementDetailExternalModel" /> class.
        /// </summary>
        /// <param name="code">code.</param>
        /// <param name="description">description.</param>
        /// <param name="parameters">parameters.</param>
        public AccessManagementDetailExternalModel(AccessManagementDetailCodeExternalModel? code = default(AccessManagementDetailCodeExternalModel?), string description = default(string), Dictionary<string, List<AccessManagementAttributeMatchExternalModel>> parameters = default(Dictionary<string, List<AccessManagementAttributeMatchExternalModel>>))
        {
            this.Code = code;
            this.Description = description;
            this.Parameters = parameters;
        }

        /// <summary>
        /// Gets or Sets Description
        /// </summary>
        [DataMember(Name = "description", EmitDefaultValue = true)]
        public string Description { get; set; }

        /// <summary>
        /// Gets or Sets Parameters
        /// </summary>
        [DataMember(Name = "parameters", EmitDefaultValue = true)]
        public Dictionary<string, List<AccessManagementAttributeMatchExternalModel>> Parameters { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class AccessManagementDetailExternalModel {\n");
            sb.Append("  Code: ").Append(Code).Append("\n");
            sb.Append("  Description: ").Append(Description).Append("\n");
            sb.Append("  Parameters: ").Append(Parameters).Append("\n");
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
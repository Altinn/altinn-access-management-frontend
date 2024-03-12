/*
 * altinn-platform-register
 *
 * Altinn Platform Register
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

namespace Altinn.AccessManagement.UI.Integrations.Register.Models
{
    /// <summary>
    /// RegisterPersonModel
    /// </summary>
    [DataContract(Name = "Person")]
    public partial class RegisterPersonModel : IValidatableObject
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterPersonModel" /> class.
        /// </summary>
        /// <param name="sSN">Identifier.</param>
        /// <param name="name">Name of the person.</param>
        /// <param name="firstName">Firstname.</param>
        public RegisterPersonModel(string sSN = default(string), string name = default(string), string firstName = default(string))
        {
            this.SSN = sSN;
            this.Name = name;
            this.FirstName = firstName;
        }

        /// <summary>
        /// Identifier
        /// </summary>
        /// <value>Identifier</value>
        [DataMember(Name = "SSN", EmitDefaultValue = false)]
        public string SSN { get; set; }

        /// <summary>
        /// Name of the person
        /// </summary>
        /// <value>Name of the person</value>
        [DataMember(Name = "Name", EmitDefaultValue = false)]
        public string Name { get; set; }

        /// <summary>
        /// Firstname
        /// </summary>
        /// <value>Firstname</value>
        [DataMember(Name = "FirstName", EmitDefaultValue = false)]
        public string FirstName { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class RegisterPersonModel {\n");
            sb.Append("  SSN: ").Append(SSN).Append("\n");
            sb.Append("  Name: ").Append(Name).Append("\n");
            sb.Append("  FirstName: ").Append(FirstName).Append("\n");
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
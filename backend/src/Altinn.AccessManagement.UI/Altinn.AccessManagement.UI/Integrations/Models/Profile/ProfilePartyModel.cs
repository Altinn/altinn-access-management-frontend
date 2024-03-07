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
    /// ProfilePartyModel
    /// </summary>
    [DataContract(Name = "Party")]
    public partial class ProfilePartyModel : IValidatableObject
    {
        /// <summary>
        /// Defines PartyTypeName
        /// </summary>
        [JsonConverter(typeof(StringEnumConverter))]
        public enum PartyTypeNameEnum
        {
            /// <summary>
            /// Enum Person for value: Person
            /// </summary>
            [EnumMember(Value = "Person")]
            Person = 1,

            /// <summary>
            /// Enum Organisation for value: Organisation
            /// </summary>
            [EnumMember(Value = "Organisation")]
            Organisation = 2,

            /// <summary>
            /// Enum SelfIdentified for value: SelfIdentified
            /// </summary>
            [EnumMember(Value = "SelfIdentified")]
            SelfIdentified = 3,

            /// <summary>
            /// Enum SubUnit for value: SubUnit
            /// </summary>
            [EnumMember(Value = "SubUnit")]
            SubUnit = 4,

            /// <summary>
            /// Enum BankruptcyEstate for value: BankruptcyEstate
            /// </summary>
            [EnumMember(Value = "BankruptcyEstate")]
            BankruptcyEstate = 5
        }


        /// <summary>
        /// Gets or Sets PartyTypeName
        /// </summary>
        [DataMember(Name = "PartyTypeName", EmitDefaultValue = false)]
        public PartyTypeNameEnum? PartyTypeName { get; set; }
        /// <summary>
        /// Initializes a new instance of the <see cref="ProfilePartyModel" /> class.
        /// </summary>
        /// <param name="partyId">the party ID.</param>
        /// <param name="partyUuid">partyUuid.</param>
        /// <param name="partyTypeName">partyTypeName.</param>
        /// <param name="orgNumber">parties org number.</param>
        /// <param name="sSN">parties ssn.</param>
        /// <param name="unitType">set unit type.</param>
        /// <param name="name">name of the party.</param>
        /// <param name="isDeleted">if party is deleted.</param>
        /// <param name="onlyHierarchyElementWithNoAccess">docs.</param>
        /// <param name="person">person.</param>
        /// <param name="organization">organization.</param>
        public ProfilePartyModel(int partyId = default(int), Guid partyUuid = default(Guid), PartyTypeNameEnum? partyTypeName = default(PartyTypeNameEnum?), string orgNumber = default(string), string sSN = default(string), string unitType = default(string), string name = default(string), bool isDeleted = default(bool), bool onlyHierarchyElementWithNoAccess = default(bool), ProfilePersonModel person = default(ProfilePersonModel), ProfileOrganizationModel organization = default(ProfileOrganizationModel))
        {
            this.PartyId = partyId;
            this.PartyUuid = partyUuid;
            this.PartyTypeName = partyTypeName;
            this.OrgNumber = orgNumber;
            this.SSN = sSN;
            this.UnitType = unitType;
            this.Name = name;
            this.IsDeleted = isDeleted;
            this.OnlyHierarchyElementWithNoAccess = onlyHierarchyElementWithNoAccess;
            this.Person = person;
            this.Organization = organization;
        }

        /// <summary>
        /// the party ID
        /// </summary>
        /// <value>the party ID</value>
        [DataMember(Name = "PartyId", EmitDefaultValue = false)]
        public int PartyId { get; set; }

        /// <summary>
        /// Gets or Sets PartyUuid
        /// </summary>
        [DataMember(Name = "PartyUuid", EmitDefaultValue = false)]
        public Guid PartyUuid { get; set; }

        /// <summary>
        /// parties org number
        /// </summary>
        /// <value>parties org number</value>
        [DataMember(Name = "OrgNumber", EmitDefaultValue = false)]
        public string OrgNumber { get; set; }

        /// <summary>
        /// parties ssn
        /// </summary>
        /// <value>parties ssn</value>
        [DataMember(Name = "SSN", EmitDefaultValue = false)]
        public string SSN { get; set; }

        /// <summary>
        /// set unit type
        /// </summary>
        /// <value>set unit type</value>
        [DataMember(Name = "UnitType", EmitDefaultValue = false)]
        public string UnitType { get; set; }

        /// <summary>
        /// name of the party
        /// </summary>
        /// <value>name of the party</value>
        [DataMember(Name = "Name", EmitDefaultValue = false)]
        public string Name { get; set; }

        /// <summary>
        /// if party is deleted
        /// </summary>
        /// <value>if party is deleted</value>
        [DataMember(Name = "IsDeleted", EmitDefaultValue = true)]
        public bool IsDeleted { get; set; }

        /// <summary>
        /// docs
        /// </summary>
        /// <value>docs</value>
        [DataMember(Name = "OnlyHierarchyElementWithNoAccess", EmitDefaultValue = true)]
        public bool OnlyHierarchyElementWithNoAccess { get; set; }

        /// <summary>
        /// Gets or Sets Person
        /// </summary>
        [DataMember(Name = "Person", EmitDefaultValue = false)]
        public ProfilePersonModel Person { get; set; }

        /// <summary>
        /// Gets or Sets Organization
        /// </summary>
        [DataMember(Name = "Organization", EmitDefaultValue = false)]
        public ProfileOrganizationModel Organization { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class ProfilePartyModel {\n");
            sb.Append("  PartyId: ").Append(PartyId).Append("\n");
            sb.Append("  PartyUuid: ").Append(PartyUuid).Append("\n");
            sb.Append("  PartyTypeName: ").Append(PartyTypeName).Append("\n");
            sb.Append("  OrgNumber: ").Append(OrgNumber).Append("\n");
            sb.Append("  SSN: ").Append(SSN).Append("\n");
            sb.Append("  UnitType: ").Append(UnitType).Append("\n");
            sb.Append("  Name: ").Append(Name).Append("\n");
            sb.Append("  IsDeleted: ").Append(IsDeleted).Append("\n");
            sb.Append("  OnlyHierarchyElementWithNoAccess: ").Append(OnlyHierarchyElementWithNoAccess).Append("\n");
            sb.Append("  Person: ").Append(Person).Append("\n");
            sb.Append("  Organization: ").Append(Organization).Append("\n");
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

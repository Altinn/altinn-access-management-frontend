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
    /// AccessManagementPartyModel
    /// </summary>
    [DataContract(Name = "Party")]
    public partial class AccessManagementPartyModel : IValidatableObject
    {

        /// <summary>
        /// Gets or Sets PartyTypeName
        /// </summary>
        [DataMember(Name = "partyTypeName", EmitDefaultValue = false)]
        public AccessManagementPartyTypeModel? PartyTypeName { get; set; }
        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementPartyModel" /> class.
        /// </summary>
        /// <param name="partyId">partyId.</param>
        /// <param name="partyUuid">partyUuid.</param>
        /// <param name="partyTypeName">partyTypeName.</param>
        /// <param name="orgNumber">orgNumber.</param>
        /// <param name="ssn">ssn.</param>
        /// <param name="unitType">unitType.</param>
        /// <param name="name">name.</param>
        /// <param name="isDeleted">isDeleted.</param>
        /// <param name="onlyHierarchyElementWithNoAccess">onlyHierarchyElementWithNoAccess.</param>
        /// <param name="person">person.</param>
        /// <param name="organization">organization.</param>
        /// <param name="childParties">childParties.</param>
        public AccessManagementPartyModel(int partyId = default(int), Guid? partyUuid = default(Guid?), AccessManagementPartyTypeModel? partyTypeName = default(AccessManagementPartyTypeModel?), string orgNumber = default(string), string ssn = default(string), string unitType = default(string), string name = default(string), bool isDeleted = default(bool), bool onlyHierarchyElementWithNoAccess = default(bool), AccessManagementPersonModel person = default(AccessManagementPersonModel), AccessManagementOrganizationModel organization = default(AccessManagementOrganizationModel), List<AccessManagementPartyModel> childParties = default(List<AccessManagementPartyModel>))
        {
            this.PartyId = partyId;
            this.PartyUuid = partyUuid;
            this.PartyTypeName = partyTypeName;
            this.OrgNumber = orgNumber;
            this.Ssn = ssn;
            this.UnitType = unitType;
            this.Name = name;
            this.IsDeleted = isDeleted;
            this.OnlyHierarchyElementWithNoAccess = onlyHierarchyElementWithNoAccess;
            this.Person = person;
            this.Organization = organization;
            this.ChildParties = childParties;
        }

        /// <summary>
        /// Gets or Sets PartyId
        /// </summary>
        [DataMember(Name = "partyId", EmitDefaultValue = false)]
        public int PartyId { get; set; }

        /// <summary>
        /// Gets or Sets PartyUuid
        /// </summary>
        [DataMember(Name = "partyUuid", EmitDefaultValue = true)]
        public Guid? PartyUuid { get; set; }

        /// <summary>
        /// Gets or Sets OrgNumber
        /// </summary>
        [DataMember(Name = "orgNumber", EmitDefaultValue = true)]
        public string OrgNumber { get; set; }

        /// <summary>
        /// Gets or Sets Ssn
        /// </summary>
        [DataMember(Name = "ssn", EmitDefaultValue = true)]
        public string Ssn { get; set; }

        /// <summary>
        /// Gets or Sets UnitType
        /// </summary>
        [DataMember(Name = "unitType", EmitDefaultValue = true)]
        public string UnitType { get; set; }

        /// <summary>
        /// Gets or Sets Name
        /// </summary>
        [DataMember(Name = "name", EmitDefaultValue = true)]
        public string Name { get; set; }

        /// <summary>
        /// Gets or Sets IsDeleted
        /// </summary>
        [DataMember(Name = "isDeleted", EmitDefaultValue = true)]
        public bool IsDeleted { get; set; }

        /// <summary>
        /// Gets or Sets OnlyHierarchyElementWithNoAccess
        /// </summary>
        [DataMember(Name = "onlyHierarchyElementWithNoAccess", EmitDefaultValue = true)]
        public bool OnlyHierarchyElementWithNoAccess { get; set; }

        /// <summary>
        /// Gets or Sets Person
        /// </summary>
        [DataMember(Name = "person", EmitDefaultValue = false)]
        public AccessManagementPersonModel Person { get; set; }

        /// <summary>
        /// Gets or Sets Organization
        /// </summary>
        [DataMember(Name = "organization", EmitDefaultValue = false)]
        public AccessManagementOrganizationModel Organization { get; set; }

        /// <summary>
        /// Gets or Sets ChildParties
        /// </summary>
        [DataMember(Name = "childParties", EmitDefaultValue = true)]
        public List<AccessManagementPartyModel> ChildParties { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("class AccessManagementPartyModel {\n");
            sb.Append("  PartyId: ").Append(PartyId).Append("\n");
            sb.Append("  PartyUuid: ").Append(PartyUuid).Append("\n");
            sb.Append("  PartyTypeName: ").Append(PartyTypeName).Append("\n");
            sb.Append("  OrgNumber: ").Append(OrgNumber).Append("\n");
            sb.Append("  Ssn: ").Append(Ssn).Append("\n");
            sb.Append("  UnitType: ").Append(UnitType).Append("\n");
            sb.Append("  Name: ").Append(Name).Append("\n");
            sb.Append("  IsDeleted: ").Append(IsDeleted).Append("\n");
            sb.Append("  OnlyHierarchyElementWithNoAccess: ").Append(OnlyHierarchyElementWithNoAccess).Append("\n");
            sb.Append("  Person: ").Append(Person).Append("\n");
            sb.Append("  Organization: ").Append(Organization).Append("\n");
            sb.Append("  ChildParties: ").Append(ChildParties).Append("\n");
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
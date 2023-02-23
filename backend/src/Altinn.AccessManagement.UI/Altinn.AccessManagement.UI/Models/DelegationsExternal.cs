﻿using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.Core.UI.Enums;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Models
{
    public class DelegationsExternal
    {
        /// <summary>
        /// Gets or sets the name of the delegation receiver
        /// </summary>
        public string CoveredByName { get; set; }

        /// <summary>
        /// Gets or sets the name of the delegator
        /// </summary>
        public string OfferedByName { get; set; }

        /// <summary>
        /// Gets or sets the userid id for the delegation
        /// </summary>
        public int OfferedByPartyId { get; set; }

        /// <summary>
        /// Gets or sets the reportee that received the delegation
        /// </summary>
        public int? CoveredByPartyId { get; set; }

        /// <summary>
        /// Gets or sets the user id of the user that performed the delegation change (either added or removed rules to the policy, or deleted it entirely).
        /// </summary>
        public int PerformedByUserId { get; set; }

        /// <summary>
        /// Gets or sets the userid that performed the delegation
        /// </summary>
        public DateTime Created { get; set; }

        /// <summary>
        /// Gets or sets the organization number that offered the delegation
        /// </summary>
        public int OfferedByOrganizationNumber { get; set; }

        /// <summary>
        /// Gets or sets the organization number that received the delegation
        /// </summary>
        public int CoveredByOrganizationNumber { get; set; }

        /// <summary>
        /// Gets or sets the organization number that received the delegation
        /// </summary>
        public string ResourceId { get; set; }

        /// <summary>
        /// The title of resource
        /// </summary>
        public string ResourceTitle { get; set; }

        /// <summary>
        /// Gets or sets the resource type of the delegation
        /// </summary>
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResourceType ResourceType { get; set; }

        /// <summary>
        /// Owner of resource
        /// </summary>
        public string ResourceOwner { get; set; }

        /// <summary>
        /// Resource description
        /// </summary>
        public string ResourceDescription { get; set; }

        /// <summary>
        /// HasCompetentAuthority
        /// </summary>
        public CompetentAuthority HasCompetentAuthority { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public Dictionary<string, string> Description { get; set; }

        /// <summary>
        /// Description explaining the rights a recipient will receive if given access to the resource
        /// </summary>
        public Dictionary<string, string> RightDescription { get; set; }

    }
}

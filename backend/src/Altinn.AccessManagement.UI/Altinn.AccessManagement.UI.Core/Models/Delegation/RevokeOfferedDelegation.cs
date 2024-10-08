﻿using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    ///     Model for revoking a delegation of one or more rights a reportee has offered to another party.
    /// </summary>
    public class RevokeOfferedDelegation
    {
        /// <summary>
        ///     Gets or sets a set of Attribute Id and Attribute Value identifying the party the delegated rights to be revoked,
        ///     have been offered to.
        /// </summary>
        [Required]
        public List<IdValuePair> To { get; set; }

        /// <summary>
        ///     Gets or sets a list of rights identifying what is to be revoked
        ///     NOTE:
        ///     If the right only specifies the top-level resource identifier or org/app without an action specification,
        ///     the operation will find and revoke all the rights the recipient party have received for the given resource.
        /// </summary>
        [Required]
        public List<Right> Rights { get; set; }

        /// <summary>
        ///     Initializes a new instance of the <see cref="RevokeOfferedDelegation"/> class.
        /// </summary>
        /// <param name="dto">The DTO object containing the data for the delegation.</param>
        public RevokeOfferedDelegation(RevokeDelegationDTO dto)
        {
            To = new List<IdValuePair> { new IdValuePair { Id = "urn:altinn:organizationnumber", Value = dto.OrgNumber } };
            Rights = new List<Right> { new Right { Resource = new List<IdValuePair> { new IdValuePair { Id = "urn:altinn:resource", Value = dto.ApiId } } } };
        }
    }
}

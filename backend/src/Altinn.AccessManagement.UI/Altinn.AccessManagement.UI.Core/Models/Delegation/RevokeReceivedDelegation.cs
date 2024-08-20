using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    ///     Model for revoking a delegation of one or more rights a reportee has received from another party.
    /// </summary>
    public class RevokeReceivedDelegation
    {
        /// <summary>
        ///     Gets or sets a set of Attribute Id and Attribute Value identifying the party the delegated rights to be revoked,
        ///     have been received from.
        /// </summary>
        [Required]
        public List<IdValuePair> From { get; set; }

        /// <summary>
        ///     Gets or sets a list of rights identifying what is to be revoked
        ///     NOTE:
        ///     If the right only specifies the top-level resource identifier or org/app without an action specification,
        ///     the operation will find and revoke all the rights received from the delegating party.
        /// </summary>
        [Required]
        public List<Right> Rights { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="RevokeReceivedDelegation"/> class.
        /// </summary>
        /// <param name="dto">The data transfer object for revoking a received delegation.</param>
        public RevokeReceivedDelegation(RevokeDelegationDTO dto) 
        {
            From = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:organizationnumber",
                    Value = dto.OrgNr
                }
            };

            Rights = new List<Right>
            {
                new Right
                {
                    Resource = new List<IdValuePair>
                    {
                        new IdValuePair
                        {
                            Id = "urn:altinn:resource",
                            Value = dto.ApiId
                        }
                    }
                }
            };
        }
    }
}

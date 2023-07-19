using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    ///     This model describes a single right
    /// </summary>
    public class DelegationRequestDto
    {
        /// <summary>
        ///     Gets or sets the list of resource matches which uniquely identifies the resource this right applies to.
        /// </summary>
        [Required]
        public List<AttributeMatch> Resource { get; set; }

        /// <summary>
        ///     Gets or sets the set of Attribute Id and Attribute Value for a specific action, to identify the action this right
        ///     applies to
        /// </summary>
        public AttributeMatch? Action { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// This model describes a single right
    /// </summary>
    public class BaseRight
    {
        /// <summary>
        /// Gets or sets the list of resource matches which uniquely identifies the resource this right applies to.
        /// </summary>
        [Required]
        public List<AttributeMatch> Resource { get; set; }
    }
}

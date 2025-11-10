using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace Altinn.AccessManagement.UI.Core.Models.Connections;

/// <summary>
/// Input for connection controller.
/// </summary>
public class PersonInput
{
    /// <summary>
    /// The person identifier.
    /// </summary>
    [Required]
    [SwaggerSchema(Description = "Person identifier", Format = "string")]
    public string PersonIdentifier { get; set; }

    /// <summary>
    /// The last name of the person.
    /// </summary>
    [Required]
    [SwaggerSchema(Description = "Lastname", Format = "string")]
    public string LastName { get; set; }
}
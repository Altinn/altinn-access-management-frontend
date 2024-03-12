using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Models;

public class OrganizationModel
{
    [JsonPropertyName("OrganizationNumber")]
    public string OrganizationNumber { get; set; }
}
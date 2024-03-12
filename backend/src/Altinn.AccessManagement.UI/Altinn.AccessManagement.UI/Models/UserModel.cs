using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Models;

public record UserModel
{
    [JsonPropertyName("username")]
    public string UserName { get; set; }

    [JsonPropertyName("partyid")]
    public int PartyId { get; set; }

    [JsonPropertyName("userid")]
    public int UserId { get; set; }
}
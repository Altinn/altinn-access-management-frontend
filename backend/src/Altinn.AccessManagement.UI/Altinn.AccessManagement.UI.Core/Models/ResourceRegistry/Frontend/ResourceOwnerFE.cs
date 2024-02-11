namespace Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend
{
    /// <summary>
    /// The list object that is being returned to frontend when supplying resource owner data to filter in frontend
    /// </summary>
    /// <param name="OrganisationName">The name of the resource owner</param>
    /// <param name="OrganisationNumber">The organisation number to the organisation</param>
    public record ResourceOwnerFE(string OrganisationName, string OrganisationNumber);
}

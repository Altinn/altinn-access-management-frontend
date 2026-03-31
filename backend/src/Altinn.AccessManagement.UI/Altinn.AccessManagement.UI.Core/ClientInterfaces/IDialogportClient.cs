using Altinn.AccessManagement.UI.Core.Models.Dialogporten;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Client for dialogporten end user lookups.
    /// </summary>
    public interface IDialogportClient
    {
        /// <summary>
        /// Looks up dialog metadata for the supplied instance reference.
        /// </summary>
        /// <param name="authorizationToken">The enriched end user token.</param>
        /// <param name="languageCode">Language to use for localized fields.</param>
        /// <param name="instanceRef">The instance reference to resolve.</param>
        /// <returns>The dialog lookup response, or null if no dialog was found.</returns>
        Task<DialogLookup> GetDialogByInstanceRef(string authorizationToken, string languageCode, string instanceRef);
    }
}

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Authentication interface.
    /// </summary>
    public interface IAuthenticationClient
    {
        /// <summary>
        /// Refreshes the AltinnStudioRuntime JwtToken.
        /// </summary>
        /// <returns>Response message from Altinn Platform with refreshed token.</returns>
        Task<string> RefreshToken();
    }
}

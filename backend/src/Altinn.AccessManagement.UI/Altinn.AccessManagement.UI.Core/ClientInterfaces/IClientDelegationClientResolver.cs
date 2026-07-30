namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Resolves which version of the client delegation client to use. This is the only place the
    /// UseNewSingleRightsClientDelegation feature flag is evaluated, so callers stay unaware of
    /// which version answered. The v2-only single rights operations resolve through here too —
    /// the v1 client answers them as empty results or not available.
    /// When v1 is retired, delete this interface and inject <see cref="IClientDelegationClient"/>
    /// directly again.
    /// </summary>
    public interface IClientDelegationClientResolver
    {
        /// <summary>
        /// Gets the client delegation client matching the current feature flag state.
        /// </summary>
        /// <returns>The v2 client when the flag is on, otherwise the v1 client.</returns>
        Task<IClientDelegationClient> Resolve();
    }
}

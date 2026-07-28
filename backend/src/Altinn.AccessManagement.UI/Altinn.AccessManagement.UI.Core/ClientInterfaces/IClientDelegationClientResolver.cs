namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Resolves which version of the client delegation client to use for the operations that exist
    /// in both v1 and v2. This is the only place the UseNewSingleRightsClientDelegation feature flag
    /// is evaluated, so callers stay unaware of which version answered.
    /// The v2-only operations on <see cref="IClientDelegationClientV2"/> do not go through here —
    /// they have no v1 counterpart to choose between.
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

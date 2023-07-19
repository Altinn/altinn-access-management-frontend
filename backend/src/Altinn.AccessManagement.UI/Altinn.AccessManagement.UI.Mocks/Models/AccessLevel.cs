namespace Altinn.AccessManagement.UI.Mocks.Models
{
    /// <summary>
    ///     An enum to make it more easy to use GetMockedDelegationAccessCheckResponses()
    /// </summary>
    public enum AccessLevel
    {
        /// <summary>
        ///     Means the user has access to delegate nothing
        /// </summary>
        NoAccesses,

        /// <summary>
        ///     Means the user has access to delegate read access
        /// </summary>
        OnlyRead,

        /// <summary>
        ///     Means the user has access to delegate read and write access
        /// </summary>
        ReadAndWrite,

        /// <summary>
        ///     Means the user has access to delegate read and write access
        /// </summary>
        AllAccesses,

        /// <summary>
        ///     User has already delegated the single rights for the service
        /// </summary>
        AlreadyDelegated,
    }
}

namespace Altinn.AccessManagement.UI.Mocks.Models.SingleRight.CheckDelegationAccess
{
    /// <summary>
    ///     An enum to make it more easy to use GetMockedDelegationAccessCheckResponses()
    /// </summary>
    public enum AccessLevel
    {
        /// <summary>
        /// Means the user has access to delegate nothing
        /// </summary>
        NoAccessesAppid504,
        
        /// <summary>
        /// Means the user has access to delegate read access
        /// </summary>
        OnlyReadAppid505,
       
        /// <summary>
        /// Means the user has access to delegate read and write access
        /// </summary>
        ReadAndWriteAppid506,
        
        /// <summary>
        /// Means the user has access to delegate read and write access
        /// </summary>
        AllAccessesAppid503,
    }
}

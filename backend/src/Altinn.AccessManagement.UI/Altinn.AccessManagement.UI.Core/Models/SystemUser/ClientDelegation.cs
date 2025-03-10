namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// A client delegation to a system user
    /// </summary>
    public class ClientDelegation
    {
        /// <summary>
        /// Delegated party uuid
        /// </summary>
        public required Guid PartyUuid { get; set; }
    }
}
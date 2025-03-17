namespace Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend
{
    /// <summary>
    /// A client delegation to a system user
    /// </summary>
    public class AgentDelegationFE
    {
        /// <summary>
        /// Delegated party uuid
        /// </summary>
        public required Guid PartyUuid { get; set; }

        /// <summary>
        /// Delegated party id
        /// </summary>
        public required int PartyId { get; set; }
    }
}
namespace Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend
{
    /// <summary>
    /// Specific SystemUser frontend model of PartyRecord
    /// </summary>
    public class ClientPartyFE
    {
        /// <summary>
        /// Party UUID  
        /// </summary>
        public required Guid Uuid { get; set; }

        /// <summary>
        /// Party Id
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Party display name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Party organization number
        /// </summary>
        public string OrgNo { get; set; } = string.Empty;
    }
}
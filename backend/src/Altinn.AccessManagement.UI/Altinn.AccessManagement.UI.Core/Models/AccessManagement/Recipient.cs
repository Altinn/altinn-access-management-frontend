namespace Altinn.AccessManagement.UI.Core.Models.AccessManagement
{
    /// <summary>
    /// Information about a party or a system that has received an access
    /// </summary>
    public class Recipient
    {
        /// <summary>
        /// The name of the recipient
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The id of the recipient
        /// </summary>
        public Guid Uuid { get; set; }
    }
}

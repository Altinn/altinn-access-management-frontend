namespace Altinn.AccessManagement.UI.Core.Models.SingleRight
{
    /// <summary>
    /// The response model of POST, PUT, and DELETE calls to the resource access delegation endpoints
    /// </summary>
    public class ChangeResponse
    {
        /// <summary>
        /// The id of the resource that has been granted/revoked access to
        /// </summary>
        public string Resource { get; set; }

        /// <summary>
        /// The actionKeys of the actions that have been granted/revoked
        /// </summary>
        public List<string> Actions { get; set; }

        /// <summary>
        /// To whom the resource-actions have been delegated
        /// </summary>
        public Guid To { get; set; }

        /// <summary>
        /// From whom the resource-actions have been delegated
        /// </summary>
        public Guid From { get; set; }

        /// <summary>
        /// The party that performed the change
        /// </summary>
        public Guid Party { get; set; }

        /// <summary>
        /// Whether the performed change was successfull or not. If false, no change has been made to any actions.
        /// </summary>
        public bool Success { get; set; }
    }
}

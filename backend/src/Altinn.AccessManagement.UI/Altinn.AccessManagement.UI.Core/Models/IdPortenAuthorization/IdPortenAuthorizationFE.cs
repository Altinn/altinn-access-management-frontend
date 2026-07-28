namespace Altinn.AccessManagement.UI.Core.Models.IdPortenAuthorization
{
    /// <summary>
    /// Model representing an ID-porten authorization
    /// </summary>
    public class IdPortenAuthorizationFE
    {
        /// <summary>
        /// Id of the authorization
        /// </summary>
        public string AuthorizationId { get; set; }

        /// <summary>
        /// Client id of the authorization
        /// </summary>
        public string ClientId { get; set; }

        /// <summary>
        /// Client name of the authorization
        /// </summary>
        public string ClientName { get; set; }

        /// <summary>
        /// Timestamp of when the authorization was granted
        /// </summary>
        public int AuthorizedAt { get; set; }

        /// <summary>
        /// Timestamp of when the authorization expires
        /// </summary>
        public int Expires { get; set; }

        /// <summary>
        /// Scopes granted for the authorization
        /// </summary>
        public IEnumerable<ScopeFE> Scopes { get; set; }

        /// <summary>
        /// User agent string of the device that granted the authorization
        /// </summary>
        public string UserAgent { get; set; }

        /// <summary>
        /// Consumer organization name
        /// </summary>
        public string ConsumerName { get; set; }

        /// <summary>
        /// Consumer organization partyUuid
        /// </summary>
        public string ConsumerPartyUuid { get; set; }
    }

    /// <summary>
    /// Model for scope of the authorization
    /// </summary>
    public class ScopeFE
    {
        /// <summary>
        /// Technical scope name, e.g. "altinn:serviceowner/instances.read"
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description (title) of the scope
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Long description of the scope
        /// </summary>
        public string LongDescription { get; set; }
    }
}

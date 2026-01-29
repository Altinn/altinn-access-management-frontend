namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with the single rights API
    /// </summary>
    public interface ISingleRightClient
    {
        /// <summary>
        ///    Creates a new delegation of a service with rights
        /// </summary>
        /// <param name="party">The party that is performing the access delegation</param>
        /// <param name="to">The id of the right holder that will receive the access</param>
        /// <param name="from">The id of the party that the rightholder will be granted access on behalf of</param>
        /// <param name="resourceId">The id of the resource/service to be delegated</param>
        /// <param name="actionKeys">The ids of the specific rights/actions to be granted</param>
        Task<HttpResponseMessage> CreateSingleRightsAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys);

        /// <summary>
        ///    Updates an already existing delegation of a service with rights
        /// </summary>
        /// <param name="party">The party that is performing the access delegation</param>
        /// <param name="to">The id of the right holder that will receive the access</param>
        /// <param name="from">The id of the party that the rightholder will be granted access on behalf of</param>
        /// <param name="resourceId">The id of the resource/service to be delegated</param>
        /// <param name="actionKeys">The updated list of actions that the toParty should hold on the resource</param>
        Task<HttpResponseMessage> UpdateSingleRightsAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys);
    }
}

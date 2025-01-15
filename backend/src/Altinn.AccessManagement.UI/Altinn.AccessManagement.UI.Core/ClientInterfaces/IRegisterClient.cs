using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
        /// <summary>
        /// Interface for client wrapper for integration with the platform register API
        /// </summary>
        public interface IRegisterClient
        {
                /// <summary>
                /// Looks up party information for an organization based on the organization number
                /// </summary>
                /// <param name="organizationNumber">The organization number</param>
                /// <returns>
                /// Party information
                /// </returns>
                Task<Party> GetPartyForOrganization(string organizationNumber);

                /// <summary>
                /// Looks up party information for a person based on the ssn
                /// </summary>
                /// <param name="ssn">The persons ssn</param>
                /// <returns>
                /// Party information
                /// </returns>
                Task<Party> GetPartyForPerson(string ssn);

                /// <summary>
                /// Looks up party information for a list of uuids
                /// </summary>
                /// <param name="uuidList">The list of uuids to be looked up</param>
                /// <returns>
                /// A list of party information corresponding to the provided uuids
                /// </returns>
                Task<List<Party>> GetPartyList(List<Guid> uuidList);

                /// <summary>
                /// Looks up a person based on ssn and lastname.
                /// The endpoint will track the number of failed lookup attempts and block further requests if the number of failed
                /// lookups have exceeded a threshold number. The user will be prevented from performing new searches
                /// for a set time. (by throwing a 429 status exception)
                /// </summary>
                /// <param name="ssn">The persons ssn - must match latname</param>
                /// <param name="lastname">The persons lastname - must match ssn</param>
                /// <returns>
                /// Person information
                /// </returns>
                Task<Person> GetPerson(string ssn, string lastname);

                /// <summary>
                /// Looks up party name for a list of orgNumbers
                /// </summary>
                /// <param name="orgNumbers">The list of organisation numbers to be looked up</param>
                /// <param name="cancellationToken">Cancellation token</param>
                /// <returns>
                /// A list of party organisation numbers with corresponding names
                /// </returns>
                Task<List<PartyName>> GetPartyNames(IEnumerable<string> orgNumbers, CancellationToken cancellationToken);
        }
}

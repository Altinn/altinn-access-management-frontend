using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Models.User.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Register.Contracts.V1;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the delegation client. Processes and maps the required data to the frontend model
    /// </summary>
    public class ConnectionService : IConnectionService
    {
        private readonly IConnectionClient _connectionClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="ConnectionService"/> class.
        /// </summary>
        /// <param name="registerClient">handler for register client</param>
        /// <param name="connectionClient">handler for right holder client</param>
        public ConnectionService(
            IRegisterClient registerClient,
            IConnectionClient connectionClient)
        {
            _registerClient = registerClient;
            _connectionClient = connectionClient;
        }

        /// <inheritdoc/>
        public async Task<Guid?> ValidatePerson(string personIdentifier, string lastname, CancellationToken cancellationToken = default)
        {
            string personIdentifierCleaned = personIdentifier.Trim().Replace("\"", string.Empty);
            string lastnameCleaned = lastname.Trim().Replace("\"", string.Empty);

            if (string.IsNullOrWhiteSpace(personIdentifierCleaned) || string.IsNullOrWhiteSpace(lastnameCleaned))
            {
                return null;
            }

            if (!PersonIdentifierUtils.IsValidPersonIdentifier(personIdentifierCleaned))
            {
                return null;
            }

            Person person = await _registerClient.GetPerson(personIdentifierCleaned, lastnameCleaned, cancellationToken);

            if (person == null)
            {
                return null;
            }

            Party personParty = await _registerClient.GetPartyForPerson(personIdentifierCleaned, cancellationToken);

            return personParty?.PartyUuid;
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> RevokeRightHolderConnection(Guid party, Guid? from, Guid? to, CancellationToken cancellationToken = default)
        {
            HttpResponseMessage response = await _connectionClient.RevokeRightHolderConnection(party, from, to, cancellationToken);
            return response;
        }

        /// <inheritdoc/>
        public async Task<Guid> AddReporteeRightHolderConnection(Guid partyUuid, Guid? rightholderPartyUuid, PersonInput personInput, CancellationToken cancellationToken = default)
        {
            if (personInput != null)
            {
                if (string.IsNullOrWhiteSpace(personInput.PersonIdentifier) || string.IsNullOrWhiteSpace(personInput.LastName))
                {
                    throw new ArgumentException("PersonInput requires both personIdentifier and lastName.");
                }

                string personIdentifierCleaned = personInput.PersonIdentifier.Trim().Replace("\"", string.Empty);
                string lastnameCleaned = personInput.LastName.Trim().Replace("\"", string.Empty);

                if (string.IsNullOrWhiteSpace(personIdentifierCleaned) || string.IsNullOrWhiteSpace(lastnameCleaned))
                {
                    throw new ArgumentException("PersonInput requires both personIdentifier and lastName.");
                }

                if (!PersonIdentifierUtils.IsValidPersonIdentifier(personIdentifierCleaned))
                {
                    throw new ArgumentException("Invalid person identifier format");
                }

                PersonInput cleanedInput = new PersonInput
                {
                    LastName = lastnameCleaned,
                    PersonIdentifier = personIdentifierCleaned
                };

                return await _connectionClient.PostNewRightHolderConnection(partyUuid, null, cleanedInput, cancellationToken);
            }

            if (!rightholderPartyUuid.HasValue)
            {
                throw new ArgumentException("Either rightholderPartyUuid or personInput must be provided");
            }

            return await _connectionClient.PostNewRightHolderConnection(partyUuid, rightholderPartyUuid, cancellationToken: cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<List<ConnectionFE>> GetConnections(
            Guid party,
            Guid? from,
            Guid? to,
            bool includeClientDelegations = true,
            bool includeAgentConnections = true,
            CancellationToken cancellationToken = default)
        {
            List<Connection> connections = await _connectionClient.GetConnections(
                party,
                from,
                to,
                includeClientDelegations,
                includeAgentConnections,
                cancellationToken);
            return connections?.Select(ConnectionFE.FromConnection).ToList();
        }

        /// <inheritdoc/>
        public async Task<List<SimplifiedConnectionFE>> GetSimplifiedConnections(Guid party, CancellationToken cancellationToken = default)
        {
            List<SimplifiedConnection> connections = await _connectionClient.GetSimplifiedConnections(party, cancellationToken);
            return connections?.Select(SimplifiedConnectionFE.FromSimplifiedConnection).ToList();
        }
    }
}

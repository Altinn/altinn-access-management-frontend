using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate;
using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Provides operations for evaluating administrative access to bankruptcy estate functionality.
    /// </summary>
    public class BankruptcyEstateService : IBankruptcyEstateService
    {
        private readonly IBankruptcyEstateClient _bankruptcyEstateClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="BankruptcyEstateService"/> class.
        /// </summary>
        /// <param name="bankruptcyEstateClient">Client used to access bankruptcy estate data.</param>
        public BankruptcyEstateService(IBankruptcyEstateClient bankruptcyEstateClient)
        {
            _bankruptcyEstateClient = bankruptcyEstateClient;
        }

        /// <inheritdoc/>
        public async Task<bool> IsBankruptcyEstateAdmin(Guid partyId, CancellationToken cancellationToken = default)
        {
            return await _bankruptcyEstateClient.HasAnyEstates(partyId, cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<BankruptcyEstateAdministratorFE>> GetAdministrators(Guid partyId, CancellationToken cancellationToken = default)
        {
            IEnumerable<BankruptcyEstateAdministrator> administrators = await _bankruptcyEstateClient.GetAdministrators(partyId, cancellationToken);
            return administrators.Select(BankruptcyEstateAdministratorFE.FromAdministrator).ToList();
        }

        /// <inheritdoc/>
        public async Task<AssignmentDto> AddAdministrator(Guid partyId, PersonInput personInput, CancellationToken cancellationToken = default)
        {
            if (personInput == null || string.IsNullOrWhiteSpace(personInput.PersonIdentifier) || string.IsNullOrWhiteSpace(personInput.LastName))
            {
                throw new ArgumentException("PersonInput requires both personIdentifier and lastName.");
            }

            string personIdentifierCleaned = personInput.PersonIdentifier.Trim().Replace("\"", string.Empty);
            string lastNameCleaned = personInput.LastName.Trim().Replace("\"", string.Empty);

            if (string.IsNullOrWhiteSpace(personIdentifierCleaned) || string.IsNullOrWhiteSpace(lastNameCleaned))
            {
                throw new ArgumentException("PersonInput requires both personIdentifier and lastName.");
            }

            if (!PersonIdentifierUtils.IsValidPersonIdentifier(personIdentifierCleaned))
            {
                throw new ArgumentException("Invalid person identifier format");
            }

            PersonInput cleanedInput = new PersonInput
            {
                PersonIdentifier = personIdentifierCleaned,
                LastName = lastNameCleaned,
            };

            return await _bankruptcyEstateClient.AddAdministrator(partyId, cleanedInput, cancellationToken);
        }

        /// <inheritdoc/>
        public async Task RemoveAdministrator(Guid partyId, Guid user, CancellationToken cancellationToken = default)
        {
            await _bankruptcyEstateClient.RemoveAdministrator(partyId, user, cancellationToken);
        }
    }
}

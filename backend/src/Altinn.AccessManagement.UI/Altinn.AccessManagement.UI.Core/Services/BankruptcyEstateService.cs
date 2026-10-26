using Altinn.AccessManagement.UI.Core.ClientInterfaces;
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
        public async Task<bool> HasBankruptcyEstateAdminAccess(Guid partyId, CancellationToken cancellationToken = default)
        {
            return await _bankruptcyEstateClient.HasAnyEstates(partyId, cancellationToken);
        }
    }
}

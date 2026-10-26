using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for the <see cref="IBankruptcyEstateClient"/> interface.
    /// </summary>
    public class BankruptcyEstateClientMock : IBankruptcyEstateClient
    {
        /// <inheritdoc />
        public Task<bool> HasAnyEstates(Guid partyId, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(partyId.ToString());
            return Task.FromResult(true);
        }
    }
}

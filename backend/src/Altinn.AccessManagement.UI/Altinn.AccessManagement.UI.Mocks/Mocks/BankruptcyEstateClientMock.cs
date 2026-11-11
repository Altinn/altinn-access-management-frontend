using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for the <see cref="IBankruptcyEstateClient"/> interface.
    /// </summary>
    public class BankruptcyEstateClientMock : IBankruptcyEstateClient
    {
        private readonly string dataFolder;

        /// <summary>
        /// Initializes a new instane of the  <see cref="BankruptcyEstateClientMock"/> class.
        /// </summary>
        public BankruptcyEstateClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(BankruptcyEstateClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<bool> HasAnyEstates(Guid partyId, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(partyId.ToString());
            return Task.FromResult(true);
        }

        /// <inheritdoc />
        public Task<IEnumerable<BankruptcyEstateAdministrator>> GetAdministrators(Guid partyId, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(partyId.ToString());

            string dataPath = Path.Combine(dataFolder, "BankruptcyEstate", "administrators.json");
            return Task.FromResult<IEnumerable<BankruptcyEstateAdministrator>>(Util.GetMockData<List<BankruptcyEstateAdministrator>>(dataPath));
        }

        /// <inheritdoc />
        public Task<AssignmentDto> AddAdministrator(Guid partyId, PersonInput personInput, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(partyId.ToString());

            if (partyId == Guid.Parse("00000000-0000-0000-0000-000000000429"))
            {
                throw new HttpStatusException("Status Error", "Too many requests", HttpStatusCode.TooManyRequests, null, "Too many requests");
            }

            return Task.FromResult(new AssignmentDto
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
                RoleId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                FromId = partyId,
                ToId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            });
        }

        /// <inheritdoc />
        public Task RemoveAdministrator(Guid partyId, Guid user, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(partyId.ToString());
            return Task.CompletedTask;
        }
    }
}

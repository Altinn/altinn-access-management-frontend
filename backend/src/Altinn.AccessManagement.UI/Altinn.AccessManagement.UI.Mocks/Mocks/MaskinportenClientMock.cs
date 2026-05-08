using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IMaskinportenClient"/>.
    /// </summary>
    public class MaskinportenClientMock : IMaskinportenClient
    {
        private readonly string dataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenClientMock"/> class.
        /// </summary>
        public MaskinportenClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(MaskinportenClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, string supplier = null, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Maskinporten", "suppliers.json");
            IEnumerable<MaskinportenConnection> suppliers = Util.GetMockData<List<MaskinportenConnection>>(dataPath);

            if (!string.IsNullOrWhiteSpace(supplier))
            {
                suppliers = suppliers.Where(s => s.Party.OrganizationIdentifier == supplier);
            }

            return Task.FromResult(suppliers);
        }

        /// <inheritdoc />
        public Task<ResourceCheckDto> ResourceDelegationCheck(Guid party, string resource, string languageCode, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            return Task.FromResult(new ResourceCheckDto
            {
                Resource = new ResourceAM
                {
                    Name = resource,
                    RefId = resource
                },
                Rights = new List<RightCheck>
                {
                    new RightCheck
                    {
                        Right = new Right
                        {
                            Key = $"urn:altinn:resource:{resource}:urn:altinn:maskinporten:scope-access",
                            Name = "ScopeAccess"
                        },
                        Result = true,
                        ReasonCodes = new List<DelegationCheckReasonCode> { DelegationCheckReasonCode.RoleAccess }
                    }
                }
            });
        }

        /// <inheritdoc />
        public Task<bool> AddResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.FromResult(true);
        }

        /// <inheritdoc />
        public Task<IEnumerable<ResourcePermission>> GetResources(Guid party, string supplier = null, string resource = null, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            IEnumerable<ResourcePermission> resources = new List<ResourcePermission>
            {
                new ResourcePermission
                {
                    Resource = new ResourceAM
                    {
                        Name = "Maskinporten test resource",
                        RefId = "appid-400"
                    },
                    Permissions = new List<Permission>()
                }
            };

            if (!string.IsNullOrWhiteSpace(resource))
            {
                resources = resources.Where(permission => permission.Resource.RefId == resource);
            }

            return Task.FromResult(resources);
        }

        /// <inheritdoc />
        public Task RemoveResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.CompletedTask;
        }

        /// <inheritdoc />
        public Task<AssignmentDto> AddSupplier(Guid party, string supplier, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            return Task.FromResult(new AssignmentDto
            {
                Id = Guid.NewGuid(),
                FromId = party,
                ToId = Guid.NewGuid(),
                RoleId = Guid.NewGuid()
            });
        }

        /// <inheritdoc />
        public Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Maskinporten", "consumers.json");
            IEnumerable<MaskinportenConnection> consumers = Util.GetMockData<List<MaskinportenConnection>>(dataPath);
            return Task.FromResult(consumers);
        }

        /// <inheritdoc />
        public Task RemoveSupplier(Guid party, string supplier, bool cascade = false, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.CompletedTask;
        }

        /// <inheritdoc />
        public Task RemoveConsumer(Guid party, string consumer, bool cascade = false, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());
            return Task.CompletedTask;
        }
    }
}

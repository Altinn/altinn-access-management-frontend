using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using RegisterParty = Altinn.Register.Contracts.Party;

namespace Altinn.AccessManagement.UI.Tests.Services
{
    /// <summary>
    /// Tests for <see cref="SystemUserRightsResolver"/>
    /// </summary>
    public class SystemUserRightsResolverTest
    {
        private const int OwnerPartyId = 51329012;
        private static readonly Guid OwnerPartyUuid = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

        private readonly Mock<ISystemUserClient> _systemUserClient = new();
        private readonly Mock<IRegisterClient> _registerClient = new();
        private readonly SystemUserRightsResolver _resolver;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserRightsResolverTest"/> class.
        /// </summary>
        public SystemUserRightsResolverTest()
        {
            string json = $$"""{ "partyType": "organization", "partyUuid": "{{OwnerPartyUuid}}", "partyId": {{OwnerPartyId}}, "displayName": "DISKRET NÆR TIGER AS", "organizationIdentifier": "310202398", "isDeleted": false, "versionId": 1 }""";
            RegisterParty owner = JsonSerializer.Deserialize<RegisterParty>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web));
            _registerClient.Setup(c => c.GetParty(OwnerPartyUuid)).ReturnsAsync(owner);

            _resolver = new SystemUserRightsResolver(
                _systemUserClient.Object,
                _registerClient.Object,
                new MemoryCache(new MemoryCacheOptions()),
                Options.Create(new CacheConfig { PartyCacheTimeout = 5 }),
                NullLogger<SystemUserRightsResolver>.Instance);
        }

        /// <summary>
        /// Only standard system users have rights fixed by the vendor
        /// </summary>
        [Theory]
        [InlineData("standard", true)]
        [InlineData("agent", false)]
        [InlineData("someOtherType", false)]
        public async Task ApplyVendorFixedRights_UsesSystemUserType(string userType, bool expected)
        {
            PartyFE party = SystemUserParty();
            _systemUserClient
                .Setup(c => c.GetSpecificSystemUser(OwnerPartyId, party.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SystemUser { Id = party.Id.ToString(), UserType = userType });

            await _resolver.ApplyVendorFixedRights(OwnerPartyUuid, [party]);

            Assert.Equal(expected, party.IsVendorFixedRights);
        }

        /// <summary>
        /// A system user that cannot be found or fails to load is not flagged
        /// </summary>
        [Fact]
        public async Task ApplyVendorFixedRights_LookupFails_LeavesUnflagged()
        {
            PartyFE notFound = SystemUserParty();
            PartyFE failing = SystemUserParty();
            _systemUserClient
                .Setup(c => c.GetSpecificSystemUser(OwnerPartyId, notFound.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync((SystemUser)null);
            _systemUserClient
                .Setup(c => c.GetSpecificSystemUser(OwnerPartyId, failing.Id, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new HttpRequestException());

            await _resolver.ApplyVendorFixedRights(OwnerPartyUuid, [notFound, failing]);

            Assert.False(notFound.IsVendorFixedRights);
            Assert.False(failing.IsVendorFixedRights);
        }

        /// <summary>
        /// A system user appearing several times is looked up once, and every occurrence is updated
        /// </summary>
        [Fact]
        public async Task ApplyVendorFixedRights_DuplicateParties_LooksUpOnce()
        {
            Guid id = Guid.NewGuid();
            PartyFE first = SystemUserParty(id);
            PartyFE second = SystemUserParty(id);
            _systemUserClient
                .Setup(c => c.GetSpecificSystemUser(OwnerPartyId, id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SystemUser { Id = id.ToString(), UserType = "standard" });

            await _resolver.ApplyVendorFixedRights(OwnerPartyUuid, [first, second]);

            Assert.True(first.IsVendorFixedRights);
            Assert.True(second.IsVendorFixedRights);
            _systemUserClient.Verify(c => c.GetSpecificSystemUser(OwnerPartyId, id, It.IsAny<CancellationToken>()), Times.Once);
        }

        /// <summary>
        /// Without system users no lookups are made, and other parties are untouched
        /// </summary>
        [Fact]
        public async Task ApplyVendorFixedRights_NoSystemUsers_MakesNoCalls()
        {
            PartyFE person = new PartyFE { Id = Guid.NewGuid(), Type = PartyTypeFE.Person };

            await _resolver.ApplyVendorFixedRights(OwnerPartyUuid, [person]);

            Assert.False(person.IsVendorFixedRights);
            _registerClient.VerifyNoOtherCalls();
            _systemUserClient.VerifyNoOtherCalls();
        }

        private static PartyFE SystemUserParty(Guid? id = null) =>
            new PartyFE { Id = id ?? Guid.NewGuid(), Type = PartyTypeFE.SystemUser };
    }
}

using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;
using Altinn.AccessManagement.UI.Core.Models.User;
using RegisterParty = Altinn.Register.Contracts.Party;
using RegisterV1Party = Altinn.Register.Contracts.V1.Party;
using RegisterV1PartyType = Altinn.Register.Contracts.V1.PartyType;

namespace Altinn.AccessManagement.UI.Tests.Models
{
    /// <summary>
    /// Tests for the <see cref="PartyFE"/> mapping factories
    /// </summary>
    public class PartyFETest
    {
        private static readonly JsonSerializerOptions _webOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);

        /// <summary>
        /// Every party type string found in the access management platform data (Norwegian and English, any casing) maps to the right type
        /// </summary>
        [Theory]
        [InlineData("Person", PartyTypeFE.Person)]
        [InlineData("person", PartyTypeFE.Person)]
        [InlineData("Organisasjon", PartyTypeFE.Organization)]
        [InlineData("Organization", PartyTypeFE.Organization)]
        [InlineData("organization", PartyTypeFE.Organization)]
        [InlineData("Systembruker", PartyTypeFE.SystemUser)]
        [InlineData("SystemUser", PartyTypeFE.SystemUser)]
        [InlineData("SelfIdentified", PartyTypeFE.SelfIdentified)]
        [InlineData("Selvidentifisert", PartyTypeFE.SelfIdentified)]
        [InlineData("unknown", PartyTypeFE.Person)]
        [InlineData(null, PartyTypeFE.Person)]
        public void FromEntity_ParsesTypeString(string type, PartyTypeFE expected)
        {
            PartyFE actual = PartyFE.FromEntity(new Entity { Id = Guid.NewGuid(), Name = "X", Type = type });

            Assert.Equal(expected, actual.Type);
        }

        /// <summary>
        /// Entity fields, including children, are mapped; the variant becomes the unit type for organizations
        /// </summary>
        [Fact]
        public void FromEntity_MapsFieldsAndChildren()
        {
            var parentId = Guid.NewGuid();
            var childId = Guid.NewGuid();
            var entity = new Entity
            {
                Id = parentId,
                PartyId = 51329012,
                Name = "DISKRET NÆR TIGER AS",
                Type = "Organisasjon",
                Variant = "AS",
                OrganizationIdentifier = "310202398",
                Children = new List<Entity>
                {
                    new Entity { Id = childId, Name = "DISKRET NÆR TIGER AS AVD", Type = "Organisasjon", Variant = "BEDR", IsDeleted = true },
                },
            };

            PartyFE actual = PartyFE.FromEntity(entity);

            Assert.Equal(parentId, actual.Id);
            Assert.Equal(51329012, actual.PartyId);
            Assert.Equal("DISKRET NÆR TIGER AS", actual.Name);
            Assert.Equal(PartyTypeFE.Organization, actual.Type);
            Assert.Equal("AS", actual.UnitType);
            Assert.Equal("310202398", actual.OrganizationIdentifier);
            PartyFE child = Assert.Single(actual.Children);
            Assert.Equal(childId, child.Id);
            Assert.Equal("BEDR", child.UnitType);
            Assert.True(child.IsDeleted);
        }

        /// <summary>
        /// The variant of a person ("Person") is not a unit type
        /// </summary>
        [Fact]
        public void FromEntity_Person_HasNoUnitType()
        {
            PartyFE actual = PartyFE.FromEntity(new Entity { Name = "SITRONGUL MEDALJONG", Type = "Person", Variant = "Person", DateOfBirth = "1981-03-20" });

            Assert.Equal(PartyTypeFE.Person, actual.Type);
            Assert.Null(actual.UnitType);
            Assert.Equal("1981-03-20", actual.DateOfBirth);
        }

        /// <summary>
        /// Compact entities map like entities
        /// </summary>
        [Fact]
        public void FromCompactEntity_MapsFields()
        {
            var entity = new CompactEntity
            {
                Id = Guid.NewGuid(),
                PartyId = 1,
                Name = "SYSTEMBRUKER",
                Type = "Systembruker",
                Variant = "StandardSystem",
                Children = new List<CompactEntity> { new CompactEntity { Name = "child", Type = "Organisasjon", Variant = "BEDR" } },
            };

            PartyFE actual = PartyFE.FromCompactEntity(entity);

            Assert.Equal(PartyTypeFE.SystemUser, actual.Type);
            Assert.Null(actual.UnitType);
            Assert.Equal("BEDR", Assert.Single(actual.Children).UnitType);
        }

        /// <summary>
        /// A subunit keeps its main unit as parent
        /// </summary>
        [Fact]
        public void FromCompactEntity_MapsParent()
        {
            var parentId = Guid.NewGuid();
            var entity = new CompactEntity
            {
                Name = "SUBUNIT",
                Type = "Organisasjon",
                Variant = "BEDR",
                Parent = new CompactEntity { Id = parentId, Name = "MAIN UNIT", Type = "Organisasjon", Variant = "AS" },
            };

            PartyFE actual = PartyFE.FromCompactEntity(entity);

            Assert.Equal(parentId, actual.Parent.Id);
            Assert.Equal("MAIN UNIT", actual.Parent.Name);
            Assert.Equal("AS", actual.Parent.UnitType);
            Assert.Null(PartyFE.FromCompactEntity(new CompactEntity { Name = "NO PARENT" }).Parent);
        }

        /// <summary>
        /// Simplified parties map without party id or children
        /// </summary>
        [Fact]
        public void FromSimplifiedParty_MapsFields()
        {
            var id = Guid.NewGuid();
            PartyFE actual = PartyFE.FromSimplifiedParty(new SimplifiedParty { Id = id, Name = "Org", Type = "organization", Variant = "AS", OrganizationIdentifier = "123456789" });

            Assert.Equal(id, actual.Id);
            Assert.Null(actual.PartyId);
            Assert.Equal(PartyTypeFE.Organization, actual.Type);
            Assert.Equal("AS", actual.UnitType);
            Assert.Equal("123456789", actual.OrganizationIdentifier);
            Assert.Null(actual.Children);
        }

        /// <summary>
        /// Register V1 subunits become organizations that keep their unit type
        /// </summary>
        [Theory]
        [InlineData(RegisterV1PartyType.Person, PartyTypeFE.Person, null)]
        [InlineData(RegisterV1PartyType.Organisation, PartyTypeFE.Organization, "AS")]
        [InlineData(RegisterV1PartyType.SubUnit, PartyTypeFE.Organization, "AS")]
        [InlineData(RegisterV1PartyType.BankruptcyEstate, PartyTypeFE.Organization, "AS")]
        [InlineData(RegisterV1PartyType.SelfIdentified, PartyTypeFE.SelfIdentified, null)]
        public void FromRegisterParty_V1_MapsType(RegisterV1PartyType partyType, PartyTypeFE expectedType, string expectedUnitType)
        {
            var uuid = Guid.NewGuid();
            var party = new RegisterV1Party { PartyId = 50789533, PartyUuid = uuid, PartyTypeName = partyType, Name = "Name", OrgNumber = "310202398", UnitType = "AS" };

            PartyFE actual = PartyFE.FromRegisterParty(party);

            Assert.Equal(uuid, actual.Id);
            Assert.Equal(50789533, actual.PartyId);
            Assert.Equal(expectedType, actual.Type);
            Assert.Equal(expectedUnitType, actual.UnitType);
        }

        /// <summary>
        /// Register V1 child parties are mapped as children
        /// </summary>
        [Fact]
        public void FromRegisterParty_V1_MapsChildParties()
        {
            var party = new RegisterV1Party
            {
                PartyTypeName = RegisterV1PartyType.Organisation,
                UnitType = "AS",
                ChildParties = new List<RegisterV1Party> { new RegisterV1Party { PartyTypeName = RegisterV1PartyType.SubUnit, UnitType = "BEDR" } },
            };

            PartyFE actual = PartyFE.FromRegisterParty(party);

            PartyFE child = Assert.Single(actual.Children);
            Assert.Equal(PartyTypeFE.Organization, child.Type);
            Assert.Equal("BEDR", child.UnitType);
        }

        /// <summary>
        /// A Register organization maps org number and unit type
        /// </summary>
        [Fact]
        public void FromRegisterParty_Organization_MapsOrgFields()
        {
            string json = """{ "partyType": "organization", "unitType": "BEDR", "partyUuid": "cd35779b-b174-4ecc-bbef-ece13611be7f", "partyId": 51329012, "displayName": "DISKRET NÆR TIGER AS", "organizationIdentifier": "310202398", "isDeleted": false, "versionId": 805572 }""";
            RegisterParty party = JsonSerializer.Deserialize<RegisterParty>(json, _webOptions);

            PartyFE actual = PartyFE.FromRegisterParty(party);

            Assert.Equal(Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f"), actual.Id);
            Assert.Equal(51329012, actual.PartyId);
            Assert.Equal("DISKRET NÆR TIGER AS", actual.Name);
            Assert.Equal(PartyTypeFE.Organization, actual.Type);
            Assert.Equal("BEDR", actual.UnitType);
            Assert.Equal("310202398", actual.OrganizationIdentifier);
            Assert.Null(actual.DateOfBirth);
        }

        /// <summary>
        /// A Register person maps date of birth
        /// </summary>
        [Fact]
        public void FromRegisterParty_Person_MapsDateOfBirth()
        {
            string json = """{ "partyType": "person", "dateOfBirth": "1981-03-20", "partyUuid": "167536b5-f8ed-4c5a-8f48-0279507e53ae", "partyId": 50789533, "displayName": "SITRONGUL MEDALJONG", "personIdentifier": "20838198385", "isDeleted": true, "versionId": 1480096 }""";
            RegisterParty party = JsonSerializer.Deserialize<RegisterParty>(json, _webOptions);

            PartyFE actual = PartyFE.FromRegisterParty(party);

            Assert.Equal(PartyTypeFE.Person, actual.Type);
            Assert.Equal("1981-03-20", actual.DateOfBirth);
            Assert.Null(actual.UnitType);
            Assert.Null(actual.OrganizationIdentifier);
            Assert.True(actual.IsDeleted);
        }

        /// <summary>
        /// Authorized parties keep their authorization fields, also on subunits
        /// </summary>
        [Fact]
        public void FromAuthorizedParty_MapsFieldsAndSubunits()
        {
            var party = new AuthorizedParty
            {
                PartyUuid = Guid.NewGuid(),
                PartyId = 1,
                Name = "Org",
                Type = AuthorizedPartyType.Organization,
                UnitType = "AS",
                OrganizationNumber = "310202398",
                OnlyHierarchyElementWithNoAccess = true,
                AuthorizedRoles = new List<string> { "DAGL" },
                Subunits = new List<AuthorizedParty>
                {
                    new AuthorizedParty { Type = AuthorizedPartyType.Organization, UnitType = "BEDR", AuthorizedResources = new List<string> { "app_ttd_x" } },
                },
            };

            AuthorizedPartyFE actual = AuthorizedPartyFE.FromAuthorizedParty(party);

            Assert.Equal(party.PartyUuid, actual.Id);
            Assert.Equal(PartyTypeFE.Organization, actual.Type);
            Assert.Equal("AS", actual.UnitType);
            Assert.Equal("310202398", actual.OrganizationIdentifier);
            Assert.True(actual.OnlyHierarchyElementWithNoAccess);
            Assert.Equal(new List<string> { "DAGL" }, actual.AuthorizedRoles);
            AuthorizedPartyFE child = Assert.Single(actual.Children);
            Assert.Equal("BEDR", child.UnitType);
            Assert.Equal(new List<string> { "app_ttd_x" }, child.AuthorizedResources);
        }

        /// <summary>
        /// The type serializes as a string, and authorized subunits serialize with their authorization fields
        /// </summary>
        [Fact]
        public void Serialize_WritesStringTypeAndAuthorizedChildren()
        {
            AuthorizedPartyFE party = AuthorizedPartyFE.FromAuthorizedParty(new AuthorizedParty
            {
                Type = AuthorizedPartyType.Organization,
                Subunits = new List<AuthorizedParty> { new AuthorizedParty { Type = AuthorizedPartyType.Organization, AuthorizedRoles = new List<string> { "DAGL" } } },
            });

            using JsonDocument json = JsonDocument.Parse(JsonSerializer.Serialize(party, _webOptions));

            Assert.Equal("Organization", json.RootElement.GetProperty("type").GetString());
            JsonElement child = json.RootElement.GetProperty("children")[0];
            Assert.Equal("DAGL", child.GetProperty("authorizedRoles")[0].GetString());
        }
    }
}

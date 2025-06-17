using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.Role.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Models.User;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Tests.Utils
{
    /// <summary>
    ///     Class with methods that can help with assertions of larger objects.
    /// </summary>
    public static class AssertionUtil
    {
        /// <summary>
        ///     Asserts that two collections of objects have the same property values in the same positions.
        /// </summary>
        /// <typeparam name="T">The Type</typeparam>
        /// <param name="expected">A collection of expected instances</param>
        /// <param name="actual">The collection of actual instances</param>
        /// <param name="assertMethod">The assertion method to be used</param>
        public static void AssertCollections<T>(ICollection<T> expected, ICollection<T> actual, Action<T, T> assertMethod)
        {
            if (expected == null)
            {
                Assert.Null(actual);
                return;
            }

            Assert.Equal(expected.Count, actual.Count);

            Dictionary<int, T> expectedDict = new Dictionary<int, T>();
            Dictionary<int, T> actualDict = new Dictionary<int, T>();

            int i = 1;
            foreach (T ex in expected)
            {
                expectedDict.Add(i, ex);
                i++;
            }

            i = 1;
            foreach (T ac in actual)
            {
                actualDict.Add(i, ac);
                i++;
            }

            foreach (int key in expectedDict.Keys)
            {
                assertMethod(expectedDict[key], actualDict[key]);
            }
        }

        /// <summary>
        ///     Assert that two <see cref="DelegationResponseData" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(DelegationResponseData expected, DelegationResponseData actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            AssertCollections(expected.Resource, actual.Resource, AssertEqual);
            Assert.Equal(expected.Action, actual.Action);
        }

        /// <summary>
        ///     Assert that two <see cref="DelegationCheckedRightFE" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(DelegationCheckedRightFE expected, DelegationCheckedRightFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Action, actual.Action);
            Assert.Equal(expected.RightKey, actual.RightKey);
            Assert.Equal(expected.Status, actual.Status);
            AssertCollections(expected.ReasonCodes, actual.ReasonCodes, Assert.Equal);

        }

        /// <summary>
        ///     Assert that two <see cref="CompetentAuthority" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(CompetentAuthority expected, CompetentAuthority actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected?.Orgcode, actual.Orgcode);
            Assert.Equal(expected?.Organization, actual.Organization);
            Assert.Equal(expected?.Name, actual.Name);
        }

        /// <summary>
        ///     Assert that two <see cref="MaskinportenSchemaDelegationFE" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(MaskinportenSchemaDelegationFE expected, MaskinportenSchemaDelegationFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.OfferedByPartyId, actual.OfferedByPartyId);
            Assert.Equal(expected.OfferedByName, actual.OfferedByName);
            Assert.Equal(expected.OfferedByOrganizationNumber, actual.OfferedByOrganizationNumber);
            Assert.Equal(expected.CoveredByPartyId, actual.CoveredByPartyId);
            Assert.Equal(expected.CoveredByName, actual.CoveredByName);
            Assert.Equal(expected.CoveredByOrganizationNumber, actual.CoveredByOrganizationNumber);
            Assert.Equal(expected.ResourceId, actual.ResourceId);
            Assert.Equal(expected.ResourceTitle, actual.ResourceTitle);
            Assert.Equal(expected.ResourceType, actual.ResourceType);
            Assert.Equal(expected.LanguageCode, actual.LanguageCode);
            Assert.Equal(expected.ResourceOwnerOrgNumber, actual.ResourceOwnerOrgNumber);
            Assert.Equal(expected.ResourceOwnerOrgcode, actual.ResourceOwnerOrgcode);
            Assert.Equal(expected.ResourceOwnerName, actual.ResourceOwnerName);
            Assert.Equal(expected.ResourceDescription, actual.ResourceDescription);
            Assert.Equal(expected.RightDescription, actual.RightDescription);
        }

        /// <summary>
        ///     Assert that two <see cref="DelegationOutput" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(DelegationOutput expected, DelegationOutput actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            AssertCollections(expected.To, actual.To, AssertEqual);
            AssertCollections(expected.RightDelegationResults, actual.RightDelegationResults, AssertEqual);
        }

        /// <summary>
        ///     Assert that two <see cref="ServiceResource" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(ServiceResourceFE expected, ServiceResourceFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Identifier, actual.Identifier);
            Assert.Equal(expected.Title, actual.Title);
            Assert.Equal(expected.Description, actual.Description);
            Assert.Equal(expected.RightDescription, actual.RightDescription);
            Assert.Equal(expected.Delegable, actual.Delegable);
            Assert.Equal(expected.Visible, actual.Visible);
            Assert.Equal(expected.ResourceOwnerName, actual.ResourceOwnerName);
            Assert.Equal(expected.ResourceOwnerOrgNumber, actual.ResourceOwnerOrgNumber);
            Assert.Equal(expected.Homepage, actual.Homepage);
            Assert.Equal(expected.Status, actual.Status);
            Assert.Equal(expected.Spatial, actual.Spatial);
            Assert.Equal(expected.ResourceType, actual.ResourceType);
            AssertCollections(expected.AuthorizationReference, actual.AuthorizationReference, AssertEqual);
            AssertEqual(expected.ContactPoints, actual.ContactPoints);
            Assert.Equal(expected.Spatial, actual.Spatial);
            Assert.Equal(expected.ResourceReferences?.Count, actual.ResourceReferences?.Count);
            AssertEqual(expected.ResourceReferences, actual.ResourceReferences);
        }

        /// <summary>
        ///     Assert that two <see cref="AccessPackageFE" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(AccessPackageFE expected, AccessPackageFE actual)
        {
            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.Urn, actual.Urn);
            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.Description, actual.Description);
            AssertCollections(expected.Resources, actual.Resources, AssertEqual);
        }

        /// <summary>
        ///     Assert that two <see cref="ResourceAM" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(ResourceAM expected, ResourceAM actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.Description, actual.Description);
            Assert.Equal(expected.ProviderId, actual.ProviderId);
            Assert.Equal(expected.Type, actual.Type);
            Assert.NotNull(expected.Provider);
            Assert.NotNull(actual.Provider);
            Assert.Equal(expected.Provider.Name, actual.Provider.Name);
        }

        /// <summary>
        ///     Assert that two Lists of <see cref="ResourceReference" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(List<ResourceReference> expected, List<ResourceReference> actual)
        {
            if (actual == null)
            {
                Assert.Null(expected);
                return;
            }

            for (int i = 0; i < actual.Count; i++)
            {
                Assert.Equal(expected[i].ReferenceType, actual[i].ReferenceType);
                Assert.Equal(expected[i].ReferenceSource, actual[i].ReferenceSource);
                Assert.Equal(expected[i].Reference, actual[i].Reference);
            }
        }

        /// <summary>
        ///     Assert that two Lists of <see cref="ContactPoint" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(List<ContactPoint> expected, List<ContactPoint> actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            for (int i = 0; i < actual.Count; i++)
            {
                Assert.Equal(expected[i].Category, actual[i].Category);
                Assert.Equal(expected[i].Email, actual[i].Email);
                Assert.Equal(expected[i].Telephone, actual[i].Telephone);
                Assert.Equal(expected[i].ContactPage, actual[i].ContactPage);
            }
        }

        /// <summary>
        ///     Assert that two Lists of <see cref="ResourceOwnerFE" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(List<ResourceOwnerFE> expected, List<ResourceOwnerFE> actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            for (int i = 0; i < actual.Count; i++)
            {
                Assert.Equal(expected[i].OrganisationName, actual[i].OrganisationName);
                Assert.Equal(expected[i].OrganisationNumber, actual[i].OrganisationNumber);
            }
        }

        /// <summary>
        ///     Assert that two <see cref="ValidationProblemDetails" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertEqual(ValidationProblemDetails expected, ValidationProblemDetails actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Type, actual.Type);
            Assert.Equal(expected.Title, actual.Title);
            Assert.Equal(expected.Status, actual.Status);

            Assert.Equal(expected.Errors.Keys.Count, actual.Errors.Keys.Count);
            Assert.True(expected.Errors.Keys.All(expectedKey => actual.Errors.ContainsKey(expectedKey)));
            foreach (string expectedKey in expected.Errors.Keys)
            {
                Assert.Equal(actual.Errors[expectedKey], actual.Errors[expectedKey]);
            }
        }

        public static void AssertEqual(PartyFE expected, PartyFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.UnitType, actual.UnitType);
            Assert.Equal(expected.PartyTypeName, actual.PartyTypeName);
            Assert.Equal(expected.Organization, actual.Organization);
            Assert.Equal(expected.OrgNumber, actual.OrgNumber);
            Assert.Equal(expected.PartyUuid, actual.PartyUuid);
            Assert.Equal(expected.PartyId, actual.PartyId);
            Assert.Equal(expected.OnlyHierarchyElementWithNoAccess, actual.OnlyHierarchyElementWithNoAccess);
            AssertCollections<PartyFE>(expected.ChildParties, actual.ChildParties, AssertEqual);

        }

        public static void AssertEqual(AuthorizedParty expected, AuthorizedParty actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.UnitType, actual.UnitType);
            Assert.Equal(expected.OrganizationNumber, actual.OrganizationNumber);
            Assert.Equal(expected.PartyUuid, actual.PartyUuid);
            Assert.Equal(expected.PartyId, actual.PartyId);
            Assert.Equal(expected.OnlyHierarchyElementWithNoAccess, actual.OnlyHierarchyElementWithNoAccess);
            AssertCollections(expected.Subunits, actual.Subunits, AssertEqual);

        }

        public static void AssertEqual(User expected, User actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.UnitType, actual.UnitType);
            Assert.Equal(expected.OrganizationNumber, actual.OrganizationNumber);
            Assert.Equal(expected.PartyUuid, actual.PartyUuid);
            Assert.Equal(expected.PartyType, actual.PartyType);
            AssertCollections(expected.Roles, actual.Roles, Assert.Equal);

        }

        private static void AssertEqual(IdValuePair expected, IdValuePair actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.Value, actual.Value);
        }

        public static void AssertEqual(List<ApiDelegationOutput> expected, List<ApiDelegationOutput> actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Count, actual.Count);
            foreach (var item in expected)
            {
                var a = actual.FindAll(c => c.OrgNumber == item.OrgNumber && c.ApiId == item.ApiId && c.Success == item.Success);
                Assert.Single(a);
            }
        }

        public static void AssertEqual(AccessAreaFE expected, AccessAreaFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.Description, actual.Description);
            Assert.Equal(expected.IconUrl, actual.IconUrl);
            AssertCollections(expected.AccessPackages, actual.AccessPackages, AssertEqual);

        }

        public static void AssertEqual(RoleAreaFE expected, RoleAreaFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.Description, actual.Description);
            Assert.Equal(expected.IconUrl, actual.IconUrl);
            AssertCollections(expected.Roles, actual.Roles, AssertEqual);

        }

        public static void AssertEqual(UserAccesses expected, UserAccesses actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            AssertCollections(expected.AccessPackages, actual.AccessPackages, Assert.Equal);
            AssertCollections(expected.Services, actual.Services, Assert.Equal);

        }

        public static void AssertEqual(List<OrganizationApiSet> expected, List<OrganizationApiSet> actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Count, actual.Count);
            foreach (var item in expected)
            {
                var a = actual.FindAll(c => c.OrgNumber == item.OrgNumber && c.Name == item.Name);
                Assert.Single(a);
            }
        }

        public static void AssertEqual(PackagePermission expected, PackagePermission actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            AssertEqual(expected.Package, actual.Package);
            AssertCollections(expected.Permissions?.ToList(), actual.Permissions?.ToList(), AssertEqual);
        }

        public static void AssertEqual(CompactPackage expected, CompactPackage actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.AreaId, actual.AreaId);
            Assert.Equal(expected.Urn, actual.Urn);
        }

        public static void AssertEqual(Permission expected, Permission actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            AssertEqual(expected.To, actual.To);
            AssertEqual(expected.From, actual.From);
            AssertEqual(expected.Via, actual.Via);
            AssertEqual(expected.Role, actual.Role);
            AssertEqual(expected.ViaRole, actual.ViaRole);

        }

        public static void AssertEqual(CompactEntity expected, CompactEntity actual)
        {
            Assert.Equal(expected?.Id, actual?.Id);
            Assert.Equal(expected?.Name, actual?.Name);
        }

        public static void AssertEqual(CompactRole expected, CompactRole actual)
        {
            Assert.Equal(expected?.Id, actual?.Id);
            Assert.Equal(expected?.Code, actual?.Code);
        }

        public static void AssertEqual(RegisteredSystemFE expected, RegisteredSystemFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.SystemId, actual.SystemId);
            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.SystemVendorOrgNumber, actual.SystemVendorOrgNumber);
            Assert.Equal(expected.SystemVendorOrgName, actual.SystemVendorOrgName);
        }

        public static void AssertEqual(SystemUserFE expected, SystemUserFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.IntegrationTitle, actual.IntegrationTitle);
            Assert.Equal(expected.System.SystemId, actual.System.SystemId);
            Assert.Equal(expected.System.SystemVendorOrgName, actual.System.SystemVendorOrgName);
            Assert.Equal(expected.System.SystemVendorOrgNumber, actual.System.SystemVendorOrgNumber);
            AssertCollections(expected.Resources, actual.Resources, AssertEqual);
            AssertCollections(expected.AccessPackages, actual.AccessPackages, AssertEqual);
        }

        public static void AssertEqual(AccessPackage expected, AccessPackage actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.Description, actual.Description);
            AssertCollections(expected.Resources.ToList(), actual.Resources.ToList(), AssertEqual);
        }


        public static void AssertEqual(RoleAssignment expected, RoleAssignment actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.RoleId, actual.RoleId);
            Assert.Equal(expected.ToId, actual.ToId);
            AssertEqual(expected.Role, actual.Role);
        }

        static void AssertEqual(Altinn.AccessManagement.UI.Core.Models.Role.Role expected, Altinn.AccessManagement.UI.Core.Models.Role.Role actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Code, actual.Code);
            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.Description, actual.Description);
        }

        public static void AssertEqual(SystemUserRequestFE expected, SystemUserRequestFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.PartyId, actual.PartyId);
            Assert.Equal(expected.PartyUuid, actual.PartyUuid);
            Assert.Equal(expected.RedirectUrl, actual.RedirectUrl);
            Assert.Equal(expected.Status, actual.Status);
            Assert.Equal(expected.System.SystemId, actual.System.SystemId);
            Assert.Equal(expected.System.SystemVendorOrgName, actual.System.SystemVendorOrgName);
            Assert.Equal(expected.System.SystemVendorOrgNumber, actual.System.SystemVendorOrgNumber);
            AssertCollections(expected.Resources, actual.Resources, AssertEqual);
        }

        public static void AssertEqual(SystemUserChangeRequestFE expected, SystemUserChangeRequestFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.RedirectUrl, actual.RedirectUrl);
            Assert.Equal(expected.Status, actual.Status);
            Assert.Equal(expected.System.SystemId, actual.System.SystemId);
            Assert.Equal(expected.System.SystemVendorOrgName, actual.System.SystemVendorOrgName);
            Assert.Equal(expected.System.SystemVendorOrgNumber, actual.System.SystemVendorOrgNumber);
            AssertCollections(expected.Resources, actual.Resources, AssertEqual);
        }

        public static void AssertEqual(SystemUserAgentRequestFE expected, SystemUserAgentRequestFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.PartyId, actual.PartyId);
            Assert.Equal(expected.PartyUuid, actual.PartyUuid);
            Assert.Equal(expected.RedirectUrl, actual.RedirectUrl);
            Assert.Equal(expected.Status, actual.Status);
            Assert.Equal(expected.System.SystemId, actual.System.SystemId);
            Assert.Equal(expected.System.SystemVendorOrgName, actual.System.SystemVendorOrgName);
            Assert.Equal(expected.System.SystemVendorOrgNumber, actual.System.SystemVendorOrgNumber);
        }

        public static void AssertEqual(AccessPackageDelegationCheckResponse expected, AccessPackageDelegationCheckResponse actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.CanDelegate, actual.CanDelegate);
            Assert.Equal(expected.DetailCode, actual.DetailCode);
            Assert.Equal(expected.PackageId, actual.PackageId);
        }

        public static void AssertEqual(CustomerPartyFE expected, CustomerPartyFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.Name, actual.Name);
            Assert.Equal(expected.OrgNo, actual.OrgNo);
        }

        public static void AssertEqual(AgentDelegationFE expected, AgentDelegationFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.CustomerId, actual.CustomerId);
        }
    }
}

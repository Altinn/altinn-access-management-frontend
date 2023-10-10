using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
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
        ///     Assert that two <see cref="BaseRightExternal" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertBaseRightExternalEqual(DelegationResponseData expected, DelegationResponseData actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            AssertCollections(expected.Resource, actual.Resource, AssertAttributeMatchEqual);
            Assert.Equal(expected.Action, actual.Action);
        }

        /// <summary>
        ///     Assert that two <see cref="CompetentAuthorityExternal" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertCompetentAuthorityEqual(CompetentAuthority expected, CompetentAuthority actual)
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
        public static void AssertMaskinportenSchemaDelegationFEEqual(MaskinportenSchemaDelegationFE expected, MaskinportenSchemaDelegationFE actual)
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
        public static void AssertDelegationOutputEqual(DelegationOutput expected, DelegationOutput actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            AssertCollections(expected.To, actual.To, AssertAttributeMatchEqual);
            AssertCollections(expected.RightDelegationResults, actual.RightDelegationResults, AssertBaseRightExternalEqual);
        }

        /// <summary>
        ///     Assert that two <see cref="ServiceResource" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertResourceEqual(ServiceResourceFE expected, ServiceResourceFE actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Identifier, actual.Identifier);
            Assert.Equal(expected.Title, actual.Title);
            Assert.Equal(expected.Description, actual.Description);
            Assert.Equal(expected.RightDescription, actual.RightDescription);
            Assert.Equal(expected.Homepage, actual.Homepage);
            Assert.Equal(expected.Status, actual.Status);
            Assert.Equal(expected.Spatial, actual.Spatial);
            AssertContactPointsEqual(expected.ContactPoints, actual.ContactPoints);
            AssertResourceReferences(expected.ResourceReferences, actual.ResourceReferences);
            Assert.Equal(expected.Delegable, actual.Delegable);
            Assert.Equal(expected.Visible, actual.Visible);
            Assert.Equal(expected.ResourceType, actual.ResourceType);
            AssertCollections(expected.AuthorizationReference, actual.AuthorizationReference, AssertAttributeMatchEqual);
        }

        /// <summary>
        ///     Assert that two Lists of <see cref="ResourceReference" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertResourceReferences(List<ResourceReference> expected, List<ResourceReference> actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

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
        public static void AssertContactPointsEqual(List<ContactPoint> expected, List<ContactPoint> actual)
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
        ///     Assert that two <see cref="ValidationProblemDetails" /> have the same property in the same positions.
        /// </summary>
        /// <param name="expected">An instance with the expected values.</param>
        /// <param name="actual">The instance to verify.</param>
        public static void AssertValidationProblemDetailsEqual(ValidationProblemDetails expected, ValidationProblemDetails actual)
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

        private static void AssertAttributeMatchEqual(IdValuePair expected, IdValuePair actual)
        {
            Assert.NotNull(actual);
            Assert.NotNull(expected);

            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.Value, actual.Value);
        }
    }
}

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.IdPortenAuthorization;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="IdPortenAuthorizationController" />
    /// </summary>
    [Collection("IdPortenAuthorizationControllerTest")]
    public class IdPortenAuthorizationControllerTest : IClassFixture<CustomWebApplicationFactory<IdPortenAuthorizationController>>
    {
        private readonly HttpClient _client;
        private readonly JsonSerializerOptions _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public IdPortenAuthorizationControllerTest(CustomWebApplicationFactory<IdPortenAuthorizationController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetIdPortenAuthorizations returns the list of ID-porten authorizations for the logged in user
        ///     Expected: Returns 200 OK with the list of authorizations
        /// </summary>
        [Fact]
        public async Task GetIdPortenAuthorizations_ReturnsOk()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/idportenauthorization");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            List<IdPortenAuthorization> result = await response.Content.ReadFromJsonAsync<List<IdPortenAuthorization>>(_options);
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("democlient_idporten_test", result[0].Client_id);
            Assert.Equal(2, result[0].Scopes.Count());
        }

        /// <summary>
        ///     Test case: WithdrawIdPortenAuthorization withdraws the authorization with the given ID
        ///     Expected: Returns 200 OK with true
        /// </summary>
        [Fact]
        public async Task WithdrawIdPortenAuthorization_ReturnsOk()
        {
            // Arrange
            string id = "some-valid-authorization-id";

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/idportenauthorization/{id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            bool result = await response.Content.ReadFromJsonAsync<bool>();
            Assert.True(result);
        }

        /// <summary>
        ///     Test case: WithdrawIdPortenAuthorization returns 500 when an unexpected exception occurs
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task WithdrawIdPortenAuthorization_ReturnsInternalServerError_WhenUnexpectedExceptionOccurs()
        {
            // Arrange
            string id = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/idportenauthorization/{id}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///     Test case: WithdrawIdPortenAuthorization returns 500 when an HttpRequestException occurs
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task WithdrawIdPortenAuthorization_ReturnsInternalServerError_WhenHttpRequestExceptionOccurs()
        {
            // Arrange
            string id = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/idportenauthorization/{id}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }
    }
}

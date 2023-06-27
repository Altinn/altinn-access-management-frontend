using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;
using Altinn.AccessManagement.UI.Tests.Utils;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="SingleRightCotrollerTest"></see>
    /// </summary>
    [Collection("SingleRightCotrollerTest")]
    public class SingleRightCotrollerTest : IClassFixture<CustomWebApplicationFactory<SingleRightController>>
    {
        private readonly CustomWebApplicationFactory<SingleRightController> _factory;
        private readonly HttpClient _client;
        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SingleRightCotrollerTest(CustomWebApplicationFactory<SingleRightController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetSingleRightTestClient(factory);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        [Fact]
        public async Task UserDelegationAccessCheck_valid_response()
        {
            // Arrange
            string partyId = "50004223";
            
            CheckDelegationAccessDto dto = new CheckDelegationAccessDto
            {
                To = new To("urn:altinn:organizationnumber", "123456789"),
                Resource = new Resource("urn:altinn:resource", "testapi")
            };
            List<DelegationAccessCheckResponse> expectedResponse = ProduceDelegationAccessCheckResponses();
            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationAccessCheckResponse> actualResponse = await httpResponse.Content.ReadAsAsync<List<DelegationAccessCheckResponse>>();

            bool anyItemMatches = false;
            foreach (DelegationAccessCheckResponse expectedItem in expectedResponse)
            {
                foreach (DelegationAccessCheckResponse actualResponseItem in actualResponse)
                {
                    if (AreObjectsEqual(actualResponseItem, expectedItem))
                    {
                        anyItemMatches = true;
                        break;
                    }
                }
            }

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.True(anyItemMatches, "No actual responses matches the expected responses");
        }
        
        private List<DelegationAccessCheckResponse> ProduceDelegationAccessCheckResponses()
        {
            List<DelegationAccessCheckResponse> responses = new List<DelegationAccessCheckResponse>();

            responses.AddRange(ProduceUserDelegationAccessCheckNoAccesses());

            responses.AddRange(ProduceUserDelegationAccessCheckOnlyRead());

            responses.AddRange(ProduceUserDelegationAccessCheckReadAndWrite());

            responses.AddRange(ProduceUserDelegationAccessCheckAllAccesses());

            return responses;
        }
        
        /// <summary>
        ///     Produces a List<DelegationAccessCheckResponse> with only read access
        /// </summary>
        /// <returns>List<DelegationAccessCheckResponse></returns>
        public List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckNoAccesses()
        {
            List<DelegationAccessCheckResponse> responses = new List<DelegationAccessCheckResponse>
            {
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/read",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "read",
                    "NotDelegable",
                    "UserMissingRight",
                    "User does not match any of the required role requirements (DAGL, REGNA)",
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/write",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "write",
                    "NotDelegable",
                    "UserMissingRight",
                    "User does not match any of the required role requirements (DAGL, REGNA)",
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/sign",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "sign",
                    "NotDelegable",
                    "UserMissingRight",
                    "User does not match any of the required role requirements (DAGL, REGNA)",
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
            };

            return responses;
        }
        
        /// <summary>
        ///     Produces a List<DelegationAccessCheckResponse> with only read access
        /// </summary>
        /// <returns>List<DelegationAccessCheckResponse></returns>
        private List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckOnlyRead()
        {
            List<DelegationAccessCheckResponse> responses = new List<DelegationAccessCheckResponse>
            {
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/read",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "read",
                    "Delegable",
                    string.Empty,
                    string.Empty,
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/write",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "write",
                    "NotDelegable",
                    "UserMissingRight",
                    "User does not match any of the required role requirements (DAGL, REGNA)",
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/sign",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "sign",
                    "NotDelegable",
                    "UserMissingRight",
                    "User does not match any of the required role requirements (DAGL, REGNA)",
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
            };

            return responses;
        }

        /// <summary>
        ///     Produces a List<DelegationAccessCheckResponse> with read and write access
        /// </summary>
        /// <returns></returns>
        private List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckReadAndWrite()
        {
            List<DelegationAccessCheckResponse> responses = new List<DelegationAccessCheckResponse>
            {
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/read",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "read",
                    "Delegable",
                    string.Empty,
                    string.Empty,
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/write",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "write",
                    "Delegable",
                    string.Empty,
                    string.Empty,
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/sign",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "sign",
                    "NotDelegable",
                    "UserMissingRight",
                    "User does not match any of the required role requirements (DAGL, REGNA)",
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
            };

            return responses;
        }

        /// <summary>
        ///     Produces a List<DelegationAccessCheckResponse> with all accesses
        /// </summary>
        /// <returns></returns>
        private List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckAllAccesses()
        {
            List<DelegationAccessCheckResponse> responses = new List<DelegationAccessCheckResponse>
            {
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/read",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "read",
                    "Delegable",
                    string.Empty,
                    string.Empty,
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/write",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "write",
                    "Delegable",
                    string.Empty,
                    string.Empty,
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationAccessCheckResponse(
                    "ttd-am-k6/sign",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "sign",
                    "Delegable",
                    string.Empty,
                    string.Empty,
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
            };

            return responses;
        }

        private bool AreObjectsEqual(DelegationAccessCheckResponse obj1, DelegationAccessCheckResponse obj2)
        {
            return obj1.RightKey == obj2.RightKey &&
                   obj1.Resource.SequenceEqual(obj2.Resource) &&
                   obj1.Action == obj2.Action &&
                   obj1.Status == obj2.Status &&
                   obj1.FaultCode == obj2.FaultCode &&
                   obj1.Reason == obj2.Reason &&
                   obj1.Params.SequenceEqual(obj2.Params) &&
                   obj1.HttpErrorResponse == obj2.HttpErrorResponse;
        }
    }
}

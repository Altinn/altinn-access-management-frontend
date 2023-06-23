using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces.MockClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate.SingleRightDelegationInputDto;
using Microsoft.AspNetCore.Http;

namespace Altinn.AccessManagement.UI.Integration.Clients.MockClients
{
    /// <inheritdoc />
    public class SingleRightMockClient : ISingleRightMockClient
    {
        private readonly HttpClient _client; 
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        ///     Initializes a new instance of <see cref="SingleRightMockClient" />
        /// </summary>
        public SingleRightMockClient(IHttpContextAccessor httpContextAccessor, HttpClient client)
        {
            _httpContextAccessor = httpContextAccessor;
            _client = client;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
        }

        /// <inheritdoc />
        public List<UserDelegationAccessCheckResponse> UserDelegationAccessCheck(string partyId, CheckDelegationAccessDto request)
        {
            Random random = new Random();
            int randomNumber = random.Next(1, 4);

            if (randomNumber == 1)
            {
                return ProduceStaticCanDelegateResponseOnlyRead();
            }

            if (randomNumber == 2)
            {
                return ProduceStaticCanDelegateResponseReadAndWrite();
            }

            return ProduceStaticCanDelegateResponseAllAccesses();
        }

        private List<UserDelegationAccessCheckResponse> ProduceStaticCanDelegateResponseOnlyRead()
        {
            List<UserDelegationAccessCheckResponse> responses = new List<UserDelegationAccessCheckResponse>
            {
                new UserDelegationAccessCheckResponse(
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
                new UserDelegationAccessCheckResponse(
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
                new UserDelegationAccessCheckResponse(
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

        private List<UserDelegationAccessCheckResponse> ProduceStaticCanDelegateResponseReadAndWrite()
        {
            List<UserDelegationAccessCheckResponse> responses = new List<UserDelegationAccessCheckResponse>
            {
                new UserDelegationAccessCheckResponse(
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
                new UserDelegationAccessCheckResponse(
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
                new UserDelegationAccessCheckResponse(
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

        private List<UserDelegationAccessCheckResponse> ProduceStaticCanDelegateResponseAllAccesses()
        {
            List<UserDelegationAccessCheckResponse> responses = new List<UserDelegationAccessCheckResponse>
            {
                new UserDelegationAccessCheckResponse(
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
                new UserDelegationAccessCheckResponse(
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
                new UserDelegationAccessCheckResponse(
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
    }
}

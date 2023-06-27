using Altinn.AccessManagement.UI.Core.ClientInterfaces.MockClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;

namespace Altinn.AccessManagement.UI.Integration.Clients.MockClients
{
    /// <inheritdoc />
    public class SingleRightMockClient : ISingleRightMockClient
    {
        /// <summary>
        ///     Initializes a new instance of <see cref="SingleRightMockClient" />
        /// </summary>
        public SingleRightMockClient()
        {
        }

        /// <inheritdoc />
        public List<DelegationAccessCheckResponse> UserDelegationAccessCheck(string partyId, CheckDelegationAccessDto request)
        {
            Random random = new Random();
            int randomNumber = random.Next(1, 5);

            if (randomNumber == 1)
            {
                return ProduceUserDelegationAccessCheckOnlyRead();
            } 
            
            if (randomNumber == 2)
            {
                return ProduceUserDelegationAccessCheckReadAndWrite();
            }

            if (randomNumber == 3)
            {
                return ProduceUserDelegationAccessCheckAllAccesses();
            }
            
            return ProduceUserDelegationAccessCheckNoAccesses();
        }

        /// <inheritdoc />
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

        /// <inheritdoc />
        public List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckOnlyRead()
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

        /// <inheritdoc />
        public List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckReadAndWrite()
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

        /// <inheritdoc />
        public List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckAllAccesses()
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
    }
}
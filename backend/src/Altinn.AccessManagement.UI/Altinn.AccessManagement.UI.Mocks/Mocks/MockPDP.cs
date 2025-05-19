using System.Security.Claims;
using Altinn.Authorization.ABAC.Xacml.JsonProfile;
using Altinn.Common.PEP.Interfaces;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock implementation of the PDP client
    /// </summary>
    public class MockPDP : IPDP
    {
        public Task<XacmlJsonResponse> GetDecisionForRequest(XacmlJsonRequestRoot xacmlJsonRequest)
        {
            XacmlJsonResponse response;

            var denyUserId = "1234";
            var denyPartyUuid = "60fb3d5b-99c2-4df0-aa77-f3fca3bc5199";

            var userIdAttribute = GetAccessSubjectAttribute(xacmlJsonRequest, "urn:altinn:userid");
            var partyUuidAttribute = GetAccessResourceAttribute(xacmlJsonRequest, "urn:altinn:party:uuid");

            if (userIdAttribute?.Value?.Any() == true || partyUuidAttribute?.Value?.Any() == true)
            {
               if (userIdAttribute?.Value?.Contains(denyUserId) == true || partyUuidAttribute?.Value?.Contains(denyPartyUuid) == true) 
                {
                    response = new XacmlJsonResponse
                    {
                        Response = [new XacmlJsonResult { Decision = "Indeterminate" }]
                    };
                    return Task.FromResult(response);
                }
            }

            response = new XacmlJsonResponse
            {
                Response = [new XacmlJsonResult { Decision = "Permit" }]
            };

            return Task.FromResult(response);

        }


        private XacmlJsonAttribute GetAccessSubjectAttribute(XacmlJsonRequestRoot request, string attributeId)
        {
            return request.Request?.AccessSubject?
                .SelectMany(subject => subject.Attribute ?? Enumerable.Empty<XacmlJsonAttribute>())
                .FirstOrDefault(attr => string.Equals(attr.AttributeId, attributeId, StringComparison.Ordinal));
        }

        private XacmlJsonAttribute GetAccessResourceAttribute(XacmlJsonRequestRoot request, string attributeId)
        {
            return request.Request?.Resource?
                .SelectMany(subject => subject.Attribute ?? Enumerable.Empty<XacmlJsonAttribute>())
                .FirstOrDefault(attr => string.Equals(attr.AttributeId, attributeId, StringComparison.Ordinal));
        }


        public Task<bool> GetDecisionForUnvalidateRequest(XacmlJsonRequestRoot xacmlJsonRequest, ClaimsPrincipal user)
        {
            return Task.FromResult(true);
        }
    }
}
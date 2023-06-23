using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.ClientInterfaces.MockClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly ISingleRightClient _singleRightClient;
        private readonly ISingleRightMockClient _singleRightMockClient;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SingleRightService" /> class
        /// </summary>
        public SingleRightService(ISingleRightClient singleRightClient, ISingleRightMockClient singleRightMockClient)
        {
            _singleRightClient = singleRightClient;
            _singleRightMockClient = singleRightMockClient;
        }

        /// <inheritdoc />
        public async Task<List<DelegationAccessCheckResponse>> CheckDelegationAccess(string partyId, CheckDelegationAccessDto request)
        {
            /* remove this comment when backend is up and add json serialization of the response.
             * Also make sure Errors are returned correctly
             *
             * HttpResponseMessage response = await _delegationClient.UserDelegationAccessCheck(partyId, request);

                if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
                {
                    return NoContent();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    ValidationProblemDetails problemDetails = JsonSerializer.Deserialize<ValidationProblemDetails>(responseContent, _serializerOptions);
                    return new ObjectResult(problemDetails);
                }
                else
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
                }
                return response;
             * 
             */

            bool isMock = string.Equals(Environment.GetEnvironmentVariable("MOCK_MODE"), "mock", StringComparison.OrdinalIgnoreCase);

            if (isMock)
            {
                return _singleRightMockClient.UserDelegationAccessCheck(partyId, request);
            }

            return await _singleRightClient.UserDelegationAccessCheck(partyId, request);
        }
    }
}

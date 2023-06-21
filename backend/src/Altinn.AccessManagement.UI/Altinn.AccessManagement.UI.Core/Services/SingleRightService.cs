using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate.SingleRightDelegationInputDto;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : IDelegationService
    {
        private readonly IDelegationClient _delegationClient;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SingleRightService" /> class
        /// </summary>
        public SingleRightService(IDelegationClient delegationClient)
        {
            _delegationClient = delegationClient;
        }

        /// <inheritdoc />
        public async Task<List<DelegationCapabiltiesResponse>> RequestCanDelegateAccess(string partyId, SingleRightDelegationInputDto request)
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

            return _delegationClient.UserDelegationAccessCheck(partyId, request);
        }
    }
}

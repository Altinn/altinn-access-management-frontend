using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IConsentClient"></see> interface
    /// </summary>
    public class ConsentClientMock : IConsentClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ConsentClient" /> class
        /// </summary>
        public ConsentClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(ConsentClientMock).Assembly.Location).LocalPath), "Data");
        }

        public Task<Result<ConsentRequestDetails>> GetConsentRequest(Guid consentRequestId, CancellationToken cancellationToken)
        {
            ConsentRequestDetails request = Util.GetMockData<ConsentRequestDetails>($"{dataFolder}/Consent/consentRequest.json");
            return Task.FromResult(new Result<ConsentRequestDetails>(request));
        }

        public Task<List<ConsentTemplate>> GetConsentTemplates()
        {
           List<ConsentTemplate> consentTemplates = Util.GetMockData<List<ConsentTemplate>>($"{dataFolder}/Consent/consentTemplates.json");
           return Task.FromResult(consentTemplates);
        }
    }
}